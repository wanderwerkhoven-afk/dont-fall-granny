using UnityEngine;

namespace DontFallGranny.Core
{
    public sealed class RecoveryInputButton : MonoBehaviour
    {
        [SerializeField] private RecoveryWindowController recoveryWindow;

        public void Recover()
        {
            recoveryWindow?.AttemptRecovery();
        }
    }
}
