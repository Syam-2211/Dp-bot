export function logInfo(message) {
  console.log(`ℹ️ INFO: ${message}`);
}

export function logSuccess(message) {
  console.log(`✅ SUCCESS: ${message}`);
}

export function logWarn(message) {
  console.log(`⚠️ WARNING: ${message}`);
}

export function logError(message, err = null) {
  console.error(`❌ ERROR: ${message}`);
  if (err) console.error(err);
}
