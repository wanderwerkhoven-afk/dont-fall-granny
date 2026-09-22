using System.Collections;
using UnityEngine;

namespace DontFallGranny.Core
{
    public sealed class GameTimeController : MonoBehaviour
    {
        private Coroutine activeHitStop;
        private float restoreScale = 1f;
        private float restoreFixedDelta = 0.02f;

        public void PlayHitStop(float timeScale, float durationRealtime)
        {
            if (activeHitStop != null)
                CancelHitStop();

            restoreScale = Time.timeScale;
            restoreFixedDelta = Time.fixedDeltaTime;
            activeHitStop = StartCoroutine(HitStopRoutine(
                Mathf.Clamp(timeScale, 0.01f, 1f),
                Mathf.Max(0f, durationRealtime)
            ));
        }

        public void CancelHitStop()
        {
            if (activeHitStop != null)
            {
                StopCoroutine(activeHitStop);
                activeHitStop = null;
            }

            RestoreTime();
        }

        private IEnumerator HitStopRoutine(float scale, float durationRealtime)
        {
            Time.timeScale = scale;
            Time.fixedDeltaTime = restoreFixedDelta * scale;

            yield return new WaitForSecondsRealtime(durationRealtime);

            RestoreTime();
            activeHitStop = null;
        }

        private void RestoreTime()
        {
            Time.timeScale = restoreScale;
            Time.fixedDeltaTime = restoreFixedDelta;
        }

        private void OnDisable()
        {
            if (activeHitStop != null)
                CancelHitStop();
        }
    }
}
