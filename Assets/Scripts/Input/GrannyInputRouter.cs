using System;
using DontFallGranny.Core;
using UnityEngine;
using UnityEngine.InputSystem;

namespace DontFallGranny.Input
{
    public sealed class GrannyInputRouter : MonoBehaviour
    {
        [SerializeField] private GameSessionFlowController sessionFlow;

        private InputAction jumpAction;
        private InputAction recoverAction;

        public event Action JumpRequested;
        public event Action RecoverRequested;

        private bool GameplayEnabled =>
            sessionFlow == null || sessionFlow.State == GameSessionState.Playing;

        private void Awake()
        {
            if (sessionFlow == null)
                sessionFlow = FindFirstObjectByType<GameSessionFlowController>();

            jumpAction = new InputAction("Jump", InputActionType.Button);
            jumpAction.AddBinding("<Keyboard>/space");
            jumpAction.AddBinding("<Keyboard>/upArrow");
            jumpAction.AddBinding("<Keyboard>/w");
            jumpAction.AddBinding("<Gamepad>/buttonSouth");

            recoverAction = new InputAction("Recover", InputActionType.Button);
            recoverAction.AddBinding("<Keyboard>/e");
            recoverAction.AddBinding("<Keyboard>/enter");
            recoverAction.AddBinding("<Gamepad>/buttonEast");
        }

        private void OnEnable()
        {
            jumpAction.performed += HandleJump;
            recoverAction.performed += HandleRecover;
            jumpAction.Enable();
            recoverAction.Enable();
        }

        private void OnDisable()
        {
            jumpAction.Disable();
            recoverAction.Disable();
            jumpAction.performed -= HandleJump;
            recoverAction.performed -= HandleRecover;
        }

        private void OnDestroy()
        {
            jumpAction?.Dispose();
            recoverAction?.Dispose();
        }

        public void RequestJump()
        {
            if (GameplayEnabled)
                JumpRequested?.Invoke();
        }

        public void RequestRecovery()
        {
            if (GameplayEnabled)
                RecoverRequested?.Invoke();
        }

        private void HandleJump(InputAction.CallbackContext _)
        {
            RequestJump();
        }

        private void HandleRecover(InputAction.CallbackContext _)
        {
            RequestRecovery();
        }
    }
}
