package com.xingling.app.utils
import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.MediaRecorder
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import android.util.DisplayMetrics
import android.view.WindowInsets
import android.view.WindowManager
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.net.HttpURLConnection
import java.net.URL
import kotlin.system.exitProcess

class UtilsModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {

    private val reactContext: ReactApplicationContext = context;
    private var mediaRecorder: MediaRecorder? = null
    private var recordingPath: String? = null

    override fun getName() = "NativeUtils"

    @ReactMethod
    fun startAudioRecording(outputPath: String, promise: Promise) {
        try {
            if (mediaRecorder != null) {
                promise.reject("RECORDING", "Already recording")
                return
            }
            val recorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                MediaRecorder(reactContext)
            } else {
                @Suppress("DEPRECATION")
                MediaRecorder()
            }
            recorder.setAudioSource(MediaRecorder.AudioSource.MIC)
            recorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            recorder.setOutputFile(outputPath)
            recorder.prepare()
            recorder.start()
            mediaRecorder = recorder
            recordingPath = outputPath
            promise.resolve(true)
        } catch (e: Exception) {
            android.util.Log.e("UtilsModule", "startAudioRecording exception: ${e.message}", e)
            releaseRecorder()
            promise.reject("RECORDING_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopAudioRecording(promise: Promise) {
        try {
            mediaRecorder?.stop()
            releaseRecorder()
            val path = recordingPath ?: ""
            recordingPath = null
            promise.resolve(path)
        } catch (e: Exception) {
            android.util.Log.e("UtilsModule", "stopAudioRecording exception: ${e.message}", e)
            releaseRecorder()
            promise.reject("RECORDING_ERROR", e.message, e)
        }
    }

    private fun releaseRecorder() {
        try {
            mediaRecorder?.release()
        } catch (e: Exception) {
            android.util.Log.e("UtilsModule", "releaseRecorder exception: ${e.message}", e)
        } finally {
            mediaRecorder = null
        }
    }

    @ReactMethod
    fun exitApp() {
        try {
            val activity = reactContext.currentActivity
            activity?.finishAndRemoveTask()
            android.os.Process.killProcess(android.os.Process.myPid())
            exitProcess(0)
        } catch (e: Exception) {
            android.util.Log.e("UtilsModule", "exitApp exception: ${e.message}", e)
        }
    }

    @ReactMethod
    fun checkStoragePermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                promise.resolve(Environment.isExternalStorageManager())
            } else {
                val readPermission = ContextCompat.checkSelfPermission(reactContext, Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED
                val writePermission = ContextCompat.checkSelfPermission(reactContext, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED
                promise.resolve(readPermission && writePermission)
            }
        } catch (e: Exception) {
            android.util.Log.e("UtilsModule", "checkStoragePermission exception: ${e.message}", e)
            promise.reject("Error", e.message)
        }
    }

    @ReactMethod
    fun requestStoragePermission() {
        try {
            val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION).apply {
                    data = Uri.parse("package:${reactContext.packageName}")
                }
            } else {
                Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.parse("package:${reactContext.packageName}")
                }
            }
            reactContext.currentActivity?.startActivity(intent)
        } catch (e: Exception) {
            android.util.Log.e("UtilsModule", "requestStoragePermission exception: ${e.message}", e)
        }
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun getWindowDimensions(): WritableMap {
        try {
            val displayMetrics: DisplayMetrics = reactApplicationContext.resources.displayMetrics
            val density = displayMetrics.density

            return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                try {
                    val windowManager = reactApplicationContext.getSystemService(Context.WINDOW_SERVICE) as WindowManager
                    val windowMetrics = windowManager.currentWindowMetrics
                    val insets = windowMetrics.windowInsets.getInsetsIgnoringVisibility(WindowInsets.Type.systemBars())
                    val bounds = windowMetrics.bounds

                    val totalWidthPx = bounds.width()
                    val totalHeightPx = bounds.height()

                    val topInsetPx = insets.top
                    val bottomInsetPx = insets.bottom

                    val usableHeightPx = totalHeightPx - topInsetPx - bottomInsetPx

                    val widthDp = totalWidthPx / density
                    val heightDp = usableHeightPx / density

                    Arguments.createMap().apply {
                        putDouble("width", widthDp.toDouble())
                        putDouble("height", heightDp.toDouble())
                    }
                } catch (e: Exception) {
                    android.util.Log.e("UtilsModule", "getWindowDimensions API 30+ exception: ${e.message}", e)
                    getWindowDimensionsFallback(displayMetrics, density)
                }
            } else {
                getWindowDimensionsFallback(displayMetrics, density)
            }
        } catch (e: Exception) {
            android.util.Log.e("UtilsModule", "getWindowDimensions exception: ${e.message}", e)
            return Arguments.createMap().apply {
                putDouble("width", 0.0)
                putDouble("height", 0.0)
            }
        }
    }

    private fun getWindowDimensionsFallback(displayMetrics: DisplayMetrics, density: Float): WritableMap {
        try {
            val widthDp = displayMetrics.widthPixels / density
            val heightDp = displayMetrics.heightPixels / density

            return Arguments.createMap().apply {
                putDouble("width", widthDp.toDouble())
                putDouble("height", heightDp.toDouble())
            }
        } catch (e: Exception) {
            android.util.Log.e("UtilsModule", "getWindowDimensionsFallback exception: ${e.message}", e)
            return Arguments.createMap().apply {
                putDouble("width", 0.0)
                putDouble("height", 0.0)
            }
        }
    }

    /**
     * 下载并安装APK
     */
    @ReactMethod
    fun downloadAndInstallApk(url: String, promise: Promise) {
        GlobalScope.launch(Dispatchers.IO) {
            try {
                android.util.Log.i("UtilsModule", "开始下载APK: $url")

                // 创建下载目录
                val downloadDir = File(reactContext.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), "updates")
                if (!downloadDir.exists()) {
                    downloadDir.mkdirs()
                }

                // 创建APK文件
                val apkFile = File(downloadDir, "update_${System.currentTimeMillis()}.apk")

                // 下载文件
                val connection = URL(url).openConnection() as HttpURLConnection
                connection.connectTimeout = 30000
                connection.readTimeout = 30000
                connection.instanceFollowRedirects = true
                connection.connect()

                val input = connection.inputStream
                val output = FileOutputStream(apkFile)

                val buffer = ByteArray(8192)
                var bytesRead: Int
                var totalBytesRead = 0L
                val totalBytes = connection.contentLength

                while (input.read(buffer).also { bytesRead = it } != -1) {
                    output.write(buffer, 0, bytesRead)
                    totalBytesRead += bytesRead
                }

                output.flush()
                output.close()
                input.close()

                android.util.Log.i("UtilsModule", "APK下载完成: ${apkFile.absolutePath}")

                // 安装APK
                withContext(Dispatchers.Main) {
                    installApk(apkFile, promise)
                }

            } catch (e: Exception) {
                android.util.Log.e("UtilsModule", "下载APK失败: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    promise.reject("DOWNLOAD_ERROR", e.message, e)
                }
            }
        }
    }

    /**
     * 安装APK
     */
    private fun installApk(apkFile: File, promise: Promise) {
        try {
            android.util.Log.i("UtilsModule", "开始安装APK: ${apkFile.absolutePath}")

            val intent = Intent(Intent.ACTION_VIEW).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
            }

            val apkUri: Uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                // Android 7.0+ 需要使用FileProvider
                FileProvider.getUriForFile(
                    reactContext,
                    "${reactContext.packageName}.fileprovider",
                    apkFile
                )
            } else {
                Uri.fromFile(apkFile)
            }

            intent.setDataAndType(apkUri, "application/vnd.android.package-archive")

            reactContext.startActivity(intent)

            android.util.Log.i("UtilsModule", "安装APK请求已发送")
            promise.resolve(true)

        } catch (e: Exception) {
            android.util.Log.e("UtilsModule", "安装APK失败: ${e.message}", e)
            promise.reject("INSTALL_ERROR", e.message, e)
        }
    }
}