using DontFallGranny.Core;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace DontFallGranny.UI
{
    public sealed class RescuePanelController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private RescueWindowController rescueWindow;
        [SerializeField] private CanvasGroup panel;
        [SerializeField] private TMP_Text titleLabel;
        [SerializeField] private TMP_Text countdownLabel;
        [SerializeField] private Image perimeterTimer;

        [Header("Text")]
        [SerializeField] private string fallTitle = "Granny is gevallen!";
        [SerializeField] private string countdownFormat = "Nog {0:0.0} seconden";

        private float fullDuration = 10f;

        private void OnEnable()
        {
            if (rescueWindow == null)
                return;

            rescueWindow.WindowOpened += HandleOpened;
            rescueWindow.CountdownChanged += HandleCountdown;
            rescueWindow.Rescued += Hide;
            rescueWindow.Expired += HandleExpired;
        }

        private void OnDisable()
        {
            if (rescueWindow == null)
                return;

            rescueWindow.WindowOpened -= HandleOpened;
            rescueWindow.CountdownChanged -= HandleCountdown;
            rescueWindow.Rescued -= Hide;
            rescueWindow.Expired -= HandleExpired;
        }

        public void OnRescuePressed()
        {
            rescueWindow?.Rescue();
        }

        public void OnGameOverPressed()
        {
            rescueWindow?.SkipToGameOver();
        }

        private void HandleOpened(float seconds)
        {
            fullDuration = Mathf.Max(0.01f, seconds);

            if (titleLabel != null)
                titleLabel.text = fallTitle;

            SetVisible(true);
            HandleCountdown(seconds);
        }

        private void HandleCountdown(float seconds)
        {
            if (countdownLabel != null)
                countdownLabel.text = string.Format(countdownFormat, seconds);

            if (perimeterTimer != null)
                perimeterTimer.fillAmount = Mathf.Clamp01(seconds / fullDuration);
        }

        private void HandleExpired()
        {
            if (countdownLabel != null)
                countdownLabel.text = "Tijd voorbij";

            SetVisible(true);
        }

        private void Hide()
        {
            SetVisible(false);
        }

        private void SetVisible(bool visible)
        {
            if (panel == null)
                return;

            panel.alpha = visible ? 1f : 0f;
            panel.interactable = visible;
            panel.blocksRaycasts = visible;
        }
    }
}
