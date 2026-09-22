using System;
using UnityEngine;
using UnityEngine.InputSystem;

namespace DontFallGranny.Input
{
    public sealed class GrannyInputRouter : MonoBehaviour
    {
        private InputAction jumpAction;
        private InputAction recoverAction;

        public event Action JumpRequested;
        public event Action RecoverRequested;

        private void Awake()
        {
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

        public void RequestJump()
        {
            JumpRequested?.Invoke();
        }

        public void RequestRecovery()
        {
            RecoverRequested?.Invoke();
        }

        private void HandleJump(InputAction.CallbackContext _)
        {
            JumpRequested?.Invoke();
        }

        private void HandleRecover(InputAction.CallbackContext _)
        {
            RecoverRequested?.Invoke();
        }
    }
}
