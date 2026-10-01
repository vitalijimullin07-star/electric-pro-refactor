package com.electricpro.app;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.print.PrintAttributes;
import android.print.PrintDocumentAdapter;
import android.print.PrintJob;
import android.print.PrintManager;
import android.util.Base64;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.activity.result.ActivityResult;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

/**
 * Electric Pro — то, чего встроенный WebView НЕ умеет сам, а приложение в браузере умеет.
 *
 * window.print() в Android WebView — пустая операция: смета, PDF-альбом плана, документы
 * и однолинейка просто не печатались бы. Скачивание файла по ссылке (экспорт проекта,
 * DXF, резервная копия базы) тоже ничего не делает — у WebView нет своего менеджера
 * загрузок. navigator.share и блокировка ориентации там отсутствуют вовсе. Всё это
 * закрывает этот плагин, а JS-прослойка assets/js/core/native-shell.js перенаправляет
 * в него УЖЕ существующие вызовы приложения — модули ничего про натив не знают.
 */
@CapacitorPlugin(name = "EpNative")
public class EpNativePlugin extends Plugin {

    // WebView печати обязан жить, пока идёт задание: его адаптер читает содержимое
    // уже ПОСЛЕ возврата из print(). Держим «вид + задание» и освобождаем завершённые
    // при следующей печати; вид, у которого задание так и не началось (лист не
    // загрузился), выбрасываем через две минуты — иначе он висел бы в памяти вечно.
    private static class PrintTask {
        WebView view;
        PrintJob job;
        long at;
    }

    private final List<PrintTask> printTasks = new ArrayList<>();

    private static PrintAttributes.MediaSize media(String size, boolean landscape) {
        PrintAttributes.MediaSize m;
        switch (size == null ? "A4" : size.toUpperCase()) {
            case "A0": m = PrintAttributes.MediaSize.ISO_A0; break;
            case "A1": m = PrintAttributes.MediaSize.ISO_A1; break;
            case "A2": m = PrintAttributes.MediaSize.ISO_A2; break;
            case "A3": m = PrintAttributes.MediaSize.ISO_A3; break;
            case "A5": m = PrintAttributes.MediaSize.ISO_A5; break;
            default: m = PrintAttributes.MediaSize.ISO_A4; break;
        }
        return landscape ? m.asLandscape() : m.asPortrait();
    }

    private static int mils(Double mm) {
        if (mm == null || mm.isNaN() || mm <= 0) return 0;
        return (int) Math.round(Math.min(mm, 60.0) / 25.4 * 1000.0);
    }

    private static String safeName(String s, String fallback) {
        String n = s == null ? "" : s.replaceAll("[\\\\/:*?\"<>|\\n\\r\\t]+", " ").trim();
        if (n.isEmpty()) n = fallback;
        return n.length() > 80 ? n.substring(0, 80) : n;
    }

    private void pruneFinishedPrints() {
        long now = System.currentTimeMillis();
        Iterator<PrintTask> it = printTasks.iterator();
        while (it.hasNext()) {
            PrintTask t = it.next();
            boolean done = t.job != null
                ? (t.job.isCompleted() || t.job.isCancelled() || t.job.isFailed())
                : now - t.at > 120000;
            if (done) {
                it.remove();
                try { t.view.destroy(); } catch (Exception ignored) {}
            }
        }
    }

    /** Печать готового HTML через системный диалог (принтер или «Сохранить как PDF»). */
    @PluginMethod
    public void print(final PluginCall call) {
        final String html = call.getString("html", "");
        final String title = safeName(call.getString("title", ""), "Electric Pro");
        final String size = call.getString("size", "A4");
        final boolean landscape = Boolean.TRUE.equals(call.getBoolean("landscape", false));
        // поля листа приходят в мм (из @page документа); PrintAttributes считает в милах
        final PrintAttributes.Margins margins = new PrintAttributes.Margins(
            mils(call.getDouble("marginLeft", 0.0)),
            mils(call.getDouble("marginTop", 0.0)),
            mils(call.getDouble("marginRight", 0.0)),
            mils(call.getDouble("marginBottom", 0.0))
        );
        if (html == null || html.isEmpty()) {
            call.reject("Пустой документ");
            return;
        }
        final Activity act = getActivity();
        act.runOnUiThread(() -> {
            try {
                pruneFinishedPrints();
                final WebView wv = new WebView(act);
                final PrintTask task = new PrintTask();
                task.view = wv;
                task.at = System.currentTimeMillis();
                printTasks.add(task);
                // печатный лист — статичный HTML/SVG; встроенные «авто-print» скрипты
                // (они писались для браузерной вкладки) здесь выполнять незачем
                wv.getSettings().setJavaScriptEnabled(false);
                wv.setWebViewClient(new WebViewClient() {
                    private boolean started = false;

                    @Override
                    public void onPageFinished(WebView view, String url) {
                        if (started) return;
                        started = true;
                        try {
                            PrintManager pm = (PrintManager) act.getSystemService(Context.PRINT_SERVICE);
                            PrintDocumentAdapter adapter = view.createPrintDocumentAdapter(title);
                            PrintAttributes attrs = new PrintAttributes.Builder()
                                .setMediaSize(media(size, landscape))
                                .setColorMode(PrintAttributes.COLOR_MODE_COLOR)
                                .setMinMargins(margins)
                                .build();
                            task.job = pm.print(title, adapter, attrs);
                            JSObject r = new JSObject();
                            r.put("ok", true);
                            call.resolve(r);
                        } catch (Exception e) {
                            printTasks.remove(task);
                            try { view.destroy(); } catch (Exception ignored) {}
                            call.reject("Печать недоступна: " + e.getMessage());
                        }
                    }
                });
                // база — папка веб-части внутри APK: относительные ссылки листа (если
                // появятся картинки) найдутся без сети
                wv.loadDataWithBaseURL("file:///android_asset/public/", html, "text/html", "UTF-8", null);
            } catch (Exception e) {
                call.reject("Печать недоступна: " + e.getMessage());
            }
        });
    }

    /** Сохранить файл через системный диалог «Сохранить как» (папку выбирает человек). */
    @PluginMethod
    public void saveFile(PluginCall call) {
        if (call.getString("data") == null) {
            call.reject("Нет данных файла");
            return;
        }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(call.getString("mime", "application/octet-stream"));
        intent.putExtra(Intent.EXTRA_TITLE, safeName(call.getString("name", ""), "electric-pro"));
        startActivityForResult(call, intent, "onSaveResult");
    }

    @ActivityCallback
    private void onSaveResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        try {
            JSObject r = new JSObject();
            Intent data = result.getData();
            if (result.getResultCode() != Activity.RESULT_OK || data == null || data.getData() == null) {
                r.put("ok", false);
                r.put("cancelled", true);
                call.resolve(r);
                return;
            }
            Uri uri = data.getData();
            byte[] bytes = Base64.decode(call.getString("data", ""), Base64.DEFAULT);
            try (OutputStream os = getContext().getContentResolver().openOutputStream(uri)) {
                if (os == null) throw new Exception("нет доступа к файлу");
                os.write(bytes);
            }
            r.put("ok", true);
            r.put("uri", uri.toString());
            call.resolve(r);
        } catch (Exception e) {
            call.reject("Не удалось сохранить: " + e.getMessage());
        } finally {
            // большой файл в base64 не держим в сохранённых вызовах моста
            try { getBridge().releaseCall(call); } catch (Exception ignored) {}
        }
    }

    /** «Поделиться» — текстом или файлом (мессенджеры, почта, диск). */
    @PluginMethod
    public void share(PluginCall call) {
        String title = call.getString("title", "");
        String text = call.getString("text", "");
        String data = call.getString("data", null);
        try {
            Intent send = new Intent(Intent.ACTION_SEND);
            if (data != null) {
                File dir = new File(getContext().getCacheDir(), "share");
                if (!dir.exists() && !dir.mkdirs()) throw new Exception("нет папки для файла");
                File f = new File(dir, safeName(call.getString("name", ""), "electric-pro"));
                try (FileOutputStream fo = new FileOutputStream(f)) {
                    fo.write(Base64.decode(data, Base64.DEFAULT));
                }
                Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", f);
                send.setType(call.getString("mime", "application/octet-stream"));
                send.putExtra(Intent.EXTRA_STREAM, uri);
                send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                if (text != null && !text.isEmpty()) send.putExtra(Intent.EXTRA_TEXT, text);
            } else {
                send.setType("text/plain");
                send.putExtra(Intent.EXTRA_TEXT, text == null ? "" : text);
            }
            if (title != null && !title.isEmpty()) send.putExtra(Intent.EXTRA_SUBJECT, title);
            Intent chooser = Intent.createChooser(send, (title == null || title.isEmpty()) ? "Поделиться" : title);
            getActivity().startActivity(chooser);
            JSObject r = new JSObject();
            r.put("ok", true);
            call.resolve(r);
        } catch (Exception e) {
            call.reject("Не удалось поделиться: " + e.getMessage());
        }
    }

    /**
     * Ориентация экрана: "landscape" | "portrait" | "unlock".
     * В браузере это screen.orientation.lock() в полноэкранном режиме (развёртка стены);
     * в WebView такого API нет. "unlock" возвращает решение системе — то есть системной
     * кнопке автоповорота, как и во всём остальном приложении.
     */
    @PluginMethod
    public void setOrientation(final PluginCall call) {
        String mode = call.getString("mode", "unlock");
        final int o;
        if ("landscape".equals(mode)) o = ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE;
        else if ("portrait".equals(mode)) o = ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT;
        else o = ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED;
        getActivity().runOnUiThread(() -> {
            getActivity().setRequestedOrientation(o);
            call.resolve();
        });
    }

    /** Версия приложения и WebView — для «О программе» и для разбора жалоб тестеров. */
    @PluginMethod
    public void getInfo(PluginCall call) {
        JSObject r = new JSObject();
        try {
            PackageInfo pi = getContext().getPackageManager().getPackageInfo(getContext().getPackageName(), 0);
            r.put("versionName", pi.versionName);
            r.put("versionCode", Build.VERSION.SDK_INT >= 28 ? pi.getLongVersionCode() : pi.versionCode);
        } catch (Exception ignored) {}
        try {
            if (Build.VERSION.SDK_INT >= 26) {
                PackageInfo wv = WebView.getCurrentWebViewPackage();
                if (wv != null) r.put("webView", wv.packageName + " " + wv.versionName);
            }
        } catch (Exception ignored) {}
        r.put("android", Build.VERSION.RELEASE);
        r.put("sdk", Build.VERSION.SDK_INT);
        r.put("device", Build.MANUFACTURER + " " + Build.MODEL);
        call.resolve(r);
    }
}
