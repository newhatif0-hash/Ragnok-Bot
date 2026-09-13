export async function runEventFeature(context, featureName, handler) {
  try {
    await handler();
  } catch (error) {
    console.error(`[${featureName}] Error:`, error.message);
  }
}
