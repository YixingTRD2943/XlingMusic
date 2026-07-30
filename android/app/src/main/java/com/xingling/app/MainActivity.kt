package com.xingling.app
import expo.modules.ReactActivityDelegateWrapper

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.os.Bundle
import android.view.View
import android.view.WindowManager

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "XingLing"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled))

  override fun onCreate(savedInstanceState: Bundle?) {
      try {
          super.onCreate(savedInstanceState);
          
          try {
              if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
                  window.setDecorFitsSystemWindows(false)
              }
          } catch (e: Exception) {
              android.util.Log.e("MainActivity", "setDecorFitsSystemWindows exception: ${e.message}", e)
          }
          
          try {
              if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) {
                  window.attributes.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
              }
          } catch (e: Exception) {
              android.util.Log.e("MainActivity", "layoutInDisplayCutoutMode exception: ${e.message}", e)
          }
      } catch (e: Exception) {
          android.util.Log.e("MainActivity", "onCreate exception: ${e.message}", e)
      }
  }

  override fun onStart() {
      try {
          super.onStart()
      } catch (e: Exception) {
          android.util.Log.e("MainActivity", "onStart exception: ${e.message}", e)
      }
  }

  override fun onResume() {
      try {
          super.onResume()
      } catch (e: Exception) {
          android.util.Log.e("MainActivity", "onResume exception: ${e.message}", e)
      }
  }
}