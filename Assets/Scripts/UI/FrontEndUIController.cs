using DontFallGranny.Core;
using UnityEngine;

namespace DontFallGranny.UI
{
    public sealed class FrontEndUIController : MonoBehaviour
    {
        [SerializeField] private GameSessionFlowController sessionFlow;
        [SerializeField] private CanvasGroup home;
        [SerializeField] private CanvasGroup loadout;
        [SerializeField] private CanvasGroup gameplayRoot;

        private void Awake()
        {
            if (sessionFlow == null)
                sessionFlow = FindFirstObjectByType<GameSessionFlowController>();
        }

        private void OnEnable()
        {
            if (sessionFlow == null)
                return;

            sessionFlow.StateChanged += HandleStateChanged;
            Apply(sessionFlow.State);
        }

        private void OnDisable()
        {
            if (sessionFlow != null)
                sessionFlow.StateChanged -= HandleStateChanged;
        }

        public void OnPlayPressed()
        {
            sessionFlow?.StartRun();
        }

        public void OnLoadoutPressed()
        {
            sessionFlow?.OpenLoadout();
        }

        public void OnHomePressed()
        {
            sessionFlow?.OpenHome();
        }

        private void HandleStateChanged(GameSessionState _, GameSessionState current)
        {
            Apply(current);
        }

        private void Apply(GameSessionState state)
        {
            SetGroup(home, state == GameSessionState.Home);
            SetGroup(loadout, state == GameSessionState.Loadout);
            SetGroup(gameplayRoot, state == GameSessionState.Playing);
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
