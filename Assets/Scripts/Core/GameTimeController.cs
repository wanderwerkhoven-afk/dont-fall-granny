using System;
using System.Collections;
using UnityEngine;

namespace DontFallGranny.Core
{
    public sealed class GameTimeController : MonoBehaviour
    {
        private Coroutine activeHitStop;
        private float restoreScale = 1f;
        private float restoreFixedDelta = 0.02f;
        private bool ownsTimeOverride;

        public bool IsHitStopActive => ownsTimeOverride;
        public event Action HitStopCompleted;

        public void PlayHitStop(float timeScale, float durationRealtime)
        {
            if (ownsTimeOverride)
                CancelHitStop();

            restoreScale = Time.timeScale;
            restoreFixedDelta = Time.fixedDeltaTime;
            ownsTimeOverride = true;

            activeHitStop = StartCoroutine(HitStopRoutine(
                Mathf.Clamp(timeScale, 0.01f, 1f),
                Mathf.Max(0f, durationRealtime)
            ));
        }

        public void CancelHitStop()
        {
            if (!ownsTimeOverride)
                return;

            if (activeHitStop != null)
            {
                StopCoroutine(activeHitStop);
                activeHitStop = null;
            }

            RestoreOwnedTime();
        }

        private IEnumerator HitStopRoutine(float scale, float durationRealtime)
        {
            Time.timeScale = scale;
            Time.fixedDeltaTime = restoreFixedDelta * scale;

            yield return new WaitForSecondsRealtime(durationRealtime);

            RestoreOwnedTime();
            activeHitStop = null;
            HitStopCompleted?.Invoke();
        }

        private void RestoreOwnedTime()
        {
            if (!ownsTimeOverride)
                return;

            Time.timeScale = restoreScale;
            Time.fixedDeltaTime = restoreFixedDelta;
            ownsTimeOverride = false;
        }

        private void OnDisable()
        {
            CancelHitStop();
        }
    }
}
