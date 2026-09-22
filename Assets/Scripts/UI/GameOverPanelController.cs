using DontFallGranny.Core;
using TMPro;
using UnityEngine;
using UnityEngine.Events;

namespace DontFallGranny.UI
{
    public sealed class GameOverPanelController : MonoBehaviour
    {
        [SerializeField] private GameSessionFlowController sessionFlow;
        [SerializeField] private GameRunStateController runState;
        [SerializeField] private BalanceController balance;
        [SerializeField] private TMP_Text resultLabel;
        [SerializeField] private UnityEvent onReplayRequested;

        public void SetResultText(string result)
        {
            if (resultLabel != null)
                resultLabel.text = result;
        }

        public void OnReplayPressed()
        {
            balance?.ResetBalance();
            runState?.SetState(GameRunState.Running);
            onReplayRequested?.Invoke();
        }

        public void OnHomePressed()
        {
            balance?.ResetBalance();
            runState?.SetState(GameRunState.Running);
            sessionFlow?.OpenHome();
        }
    }
}
