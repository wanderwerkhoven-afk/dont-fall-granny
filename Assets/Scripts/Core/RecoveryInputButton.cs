using DontFallGranny.Input;
using UnityEngine;

namespace DontFallGranny.Core
{
    public sealed class RecoveryInputButton : MonoBehaviour
    {
        [SerializeField] private GrannyInputRouter inputRouter;

        public void Recover()
        {
            inputRouter?.RequestRecovery();
        }
    }
}
