using DontFallGranny.Core;
using UnityEngine;

namespace DontFallGranny.UI
{
    public sealed class GameUIStateController : MonoBehaviour
    {
        [Header("State sources")]
        [SerializeField] private GameRunStateController runState;
        [SerializeField] private GameSessionFlowController sessionFlow;

        [Header("UI groups")]
        [SerializeField] private CanvasGroup hud;
        [SerializeField] private CanvasGroup recoveryPrompt;
        [SerializeField] private CanvasGroup rescueCard;
        [SerializeField] private CanvasGroup gameOverPanel;
        [SerializeField, Range(0f, 1f)] private float recoveringHudAlpha = 0.42f;

        private void Awake()
        {
            if (runState == null)
                runState = FindFirstObjectByType<GameRunStateController>();

            if (sessionFlow == null)
                sessionFlow = FindFirstObjectByType<GameSessionFlowController>();
        }

        private void OnEnable()
        {
            if (runState != null)
                runState.StateChanged += HandleRunStateChanged;

            if (sessionFlow != null)
                sessionFlow.StateChanged += HandleSessionStateChanged;

            Apply();
        }

        private void OnDisable()
        {
            if (runState != null)
                runState.StateChanged -= HandleRunStateChanged;

            if (sessionFlow != null)
                sessionFlow.StateChanged -= HandleSessionStateChanged;
        }

        private void HandleRunStateChanged(GameRunState _, GameRunState __)
        {
            Apply();
        }

        private void HandleSessionStateChanged(GameSessionState _, GameSessionState __)
        {
            Apply();
        }

        private void Apply()
        {
            bool playing =
                sessionFlow == null || sessionFlow.State == GameSessionState.Playing;

            GameRunState state =
                runState != null ? runState.State : GameRunState.Running;

            bool hudVisible = playing &&
                (state == GameRunState.Running || state == GameRunState.Recovering);

            SetGroup(hud, hudVisible);

            if (hud != null && hudVisible && state == GameRunState.Recovering)
            {
                hud.alpha = recoveringHudAlpha;
                hud.interactable = false;
                hud.blocksRaycasts = false;
            }

            SetGroup(recoveryPrompt, playing && state == GameRunState.Recovering);
            SetGroup(rescueCard, playing && state == GameRunState.Rescue);
            SetGroup(gameOverPanel, playing && state == GameRunState.GameOver);
        }

        private static void SetGroup(CanvasGroup group, bool visible)
        {
            if (group == null)
                return;

            group.alpha = visible ? 1f : 0f;
            group.interactable = visible;
            group.blocksRaycasts = visible;
        }
    }
}
