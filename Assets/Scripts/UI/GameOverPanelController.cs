using DontFallGranny.Core;
using TMPro;
using UnityEngine;

namespace DontFallGranny.UI
{
    public sealed class GameOverPanelController : MonoBehaviour
    {
        [SerializeField] private GameRunLifecycleController lifecycle;
        [SerializeField] private TMP_Text resultLabel;
        [SerializeField] private TMP_Text rewardLabel;

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

        public void OnReplayPressed()
        {
            lifecycle?.RestartRun();
        }

        public void OnHomePressed()
        {
            lifecycle?.ReturnHome();
        }
    }
}
