using DontFallGranny.Core;
using DontFallGranny.Input;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace DontFallGranny.UI
{
    public sealed class RecoveryPromptController : MonoBehaviour
    {
        [SerializeField] private RecoveryWindowController recoveryWindow;
        [SerializeField] private GrannyInputRouter inputRouter;
        [SerializeField] private TMP_Text countdownLabel;
        [SerializeField] private Image progressFill;

        private float duration = 1f;

        private void OnEnable()
        {
            if (recoveryWindow == null)
                return;

            recoveryWindow.RecoveryStarted += HandleStarted;
        }

        private void OnDisable()
        {
            if (recoveryWindow != null)
                recoveryWindow.RecoveryStarted -= HandleStarted;
        }

        private void Update()
        {
            if (recoveryWindow == null || !recoveryWindow.IsRecovering)
                return;

            float remaining = recoveryWindow.RemainingTime;

            if (countdownLabel != null)
                countdownLabel.text = $"Herstel! {remaining:0.0}s";

            if (progressFill != null)
                progressFill.fillAmount = Mathf.Clamp01(remaining / duration);
        }

        public void OnRecoverPressed()
        {
            inputRouter?.RequestRecovery();
        }

        private void HandleStarted(float seconds)
        {
            duration = Mathf.Max(0.01f, seconds);
        }
    }
}
