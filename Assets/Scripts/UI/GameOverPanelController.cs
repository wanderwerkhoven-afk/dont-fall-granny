using DontFallGranny.Core;
using TMPro;
using UnityEngine;

namespace DontFallGranny.UI
{
    public sealed class GameOverPanelController : MonoBehaviour
    {
        [SerializeField] private GameRunLifecycleController lifecycle;
        [SerializeField] private GameRunStateController runState;
        [SerializeField] private RunDataController runData;
        [SerializeField] private TMP_Text resultLabel;
        [SerializeField] private TMP_Text rewardLabel;

        private void Awake()
        {
            if (runState == null)
                runState = FindFirstObjectByType<GameRunStateController>();

            if (runData == null)
                runData = FindFirstObjectByType<RunDataController>();
        }

        private void OnEnable()
        {
            if (runState != null)
                runState.StateChanged += HandleRunStateChanged;
        }

        private void OnDisable()
        {
            if (runState != null)
                runState.StateChanged -= HandleRunStateChanged;
        }

        public void SetResultText(string result)
        {
            if (resultLabel != null)
                resultLabel.text = result;
        }

        public void SetRewardText(string reward)
        {
            if (rewardLabel != null)
                rewardLabel.text = reward;
        }

        public void Refresh()
        {
            if (runData == null)
                return;

            int meters = Mathf.FloorToInt(runData.DistanceMeters);
            int bestMeters = Mathf.FloorToInt(runData.BestDistanceMeters);

            SetResultText($"RUN VOORBIJ\n{meters} meter");
            SetRewardText(
                $"+{runData.Coins} coins\nBeste afstand: {bestMeters} m"
            );
        }

        public void OnReplayPressed()
        {
            lifecycle?.RestartRun();
        }

        public void OnHomePressed()
        {
            lifecycle?.ReturnHome();
        }

        private void HandleRunStateChanged(
            GameRunState _,
            GameRunState current
        )
        {
            if (current == GameRunState.GameOver)
                Refresh();
        }
    }
}
