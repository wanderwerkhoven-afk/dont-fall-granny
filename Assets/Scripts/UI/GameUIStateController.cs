using DontFallGranny.Core;
using UnityEngine;

namespace DontFallGranny.UI
{
    public sealed class GameUIStateController : MonoBehaviour
    {
        [Header("State source")]
        [SerializeField] private GameRunStateController runState;

        [Header("UI groups")]
        [SerializeField] private CanvasGroup hud;
        [SerializeField] private CanvasGroup recoveryPrompt;
        [SerializeField] private CanvasGroup rescueCard;
        [SerializeField] private CanvasGroup gameOverPanel;

        private void Awake()
        {
            if (runState == null)
                runState = FindFirstObjectByType<GameRunStateController>();
        }

        private void OnEnable()
        {
            if (runState == null)
                return;

            runState.StateChanged += HandleStateChanged;
            Apply(runState.State);
        }

        private void OnDisable()
        {
            if (runState != null)
                runState.StateChanged -= HandleStateChanged;
        }

        private void HandleStateChanged(GameRunState _, GameRunState current)
        {
            Apply(current);
        }

        private void Apply(GameRunState state)
        {
            SetGroup(hud, state == GameRunState.Running || state == GameRunState.Recovering);
            SetGroup(recoveryPrompt, state == GameRunState.Recovering);
            SetGroup(rescueCard, state == GameRunState.Rescue);
            SetGroup(gameOverPanel, state == GameRunState.GameOver);
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
