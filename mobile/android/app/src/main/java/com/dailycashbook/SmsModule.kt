package com.dailycashbook

import android.database.Cursor
import android.net.Uri
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap

class SmsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "Sms"

  @ReactMethod
  fun getMessages(filter: ReadableMap, promise: Promise) {
    try {
      val box = if (filter.hasKey("box")) filter.getString("box") ?: "inbox" else "inbox"
      val maxCount = if (filter.hasKey("maxCount")) filter.getInt("maxCount") else -1
      val indexFrom = if (filter.hasKey("indexFrom")) filter.getInt("indexFrom") else 0
      val minDate = if (filter.hasKey("minDate")) filter.getDouble("minDate").toLong() else -1L
      val maxDate = if (filter.hasKey("maxDate")) filter.getDouble("maxDate").toLong() else -1L
      val read = if (filter.hasKey("read")) filter.getInt("read") else -1
      val address = if (filter.hasKey("address")) filter.getString("address") ?: "" else ""
      val bodyRegex = if (filter.hasKey("bodyRegex")) filter.getString("bodyRegex") ?: "" else ""

      val uri = Uri.parse("content://sms/$box")
      val resolver = reactApplicationContext.contentResolver
      val cursor = resolver.query(uri, null, null, null, "date DESC")
      val result: WritableArray = Arguments.createArray()

      var count = 0
      cursor?.use { c ->
        while (c.moveToNext()) {
          var matches = true
          val date = c.getLong(c.getColumnIndexOrThrow("date"))
          if (minDate > -1 && date < minDate) matches = false
          if (maxDate > -1 && date > maxDate) matches = false
          if (matches && read > -1) matches = read == c.getInt(c.getColumnIndexOrThrow("read"))
          if (matches && address.isNotEmpty()) {
            val addr = c.getString(c.getColumnIndexOrThrow("address")) ?: ""
            matches = addr.trim() == address
          }
          if (matches && bodyRegex.isNotEmpty()) {
            val body = c.getString(c.getColumnIndexOrThrow("body")) ?: ""
            matches = body.matches(Regex(bodyRegex))
          }
          if (!matches) continue
          if (count >= indexFrom) {
            if (maxCount > 0 && count >= indexFrom + maxCount) break
            result.pushMap(cursorToMap(c))
          }
          count++
        }
      }
      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("SMS_ERROR", e.message)
    }
  }

  private fun cursorToMap(c: Cursor): WritableMap {
    val map = Arguments.createMap()
    val names = c.columnNames
    for (name in names) {
      val idx = c.getColumnIndex(name)
      if (idx < 0) continue
      when (c.getType(idx)) {
        Cursor.FIELD_TYPE_NULL -> map.putNull(name)
        Cursor.FIELD_TYPE_INTEGER -> map.putDouble(name, c.getLong(idx).toDouble())
        Cursor.FIELD_TYPE_FLOAT -> map.putDouble(name, c.getDouble(idx))
        Cursor.FIELD_TYPE_BLOB -> map.putString(name, String(c.getBlob(idx)))
        else -> map.putString(name, c.getString(idx))
      }
    }
    return map
  }
}
