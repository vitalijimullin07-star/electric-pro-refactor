package com.electricpro.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Свой плагин (печать, сохранение файлов, «Поделиться», ориентация) регистрируется
        // ДО super.onCreate: мост собирается там, и плагин, добавленный позже, JS не увидит.
        registerPlugin(EpNativePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
