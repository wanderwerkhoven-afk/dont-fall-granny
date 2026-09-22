using System;
using UnityEngine;
using UnityEngine.Events;

namespace DontFallGranny.Core
{
    public sealed class RescueWindowController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private FallController fallController;
        [SerializeField] private BalanceController balanceController;

        [Header("Timing")]
        [SerializeField] private float rescueWindowSeconds = 10f;

        [Header("Events")]
        [SerializeField] private UnityEvent onWindowOpened;
        [SerializeField] private UnityEvent<float> onCountdownChanged;
        [SerializeField] private UnityEvent onRescued;
        [SerializeField] private UnityEvent onExpired;

        private float deadline;

        public bool IsOpen { get; private set; }
        public float RemainingSeconds =>
            IsOpen ? Mathf.Max(0f, deadline - Time.unscaledTime) : 0f;

        public event Action<float> WindowOpened;
        public event Action<float> CountdownChanged;
        public event Action Rescued;
        public event Action Expired;

        private void Awake()
        {
            if (fallController == null)
                fallController = GetComponent<FallController>();

            if (balanceController == null)
                balanceController = GetComponent<BalanceController>();
        }

        private void OnEnable()
        {
            if (fallController != null)
                fallController.FallImpact += Open;
        }

        private void OnDisable()
        {
            if (fallController != null)
                fallController.FallImpact -= Open;
        }

        private void Update()
        {
            if (!IsOpen)
                return;

            float remaining = RemainingSeconds;
            onCountdownChanged?.Invoke(remaining);
            CountdownChanged?.Invoke(remaining);

            if (remaining <= 0f)
                Expire();
        }

        public void Open()
        {
            if (IsOpen)
                return;

            IsOpen = true;
            deadline = Time.unscaledTime + rescueWindowSeconds;

            onWindowOpened?.Invoke();
            WindowOpened?.Invoke(rescueWindowSeconds);
        }

        public void Rescue()
        {
            if (!IsOpen || Time.unscaledTime >= deadline)
                return;

            IsOpen = false;

            balanceController?.ResetBalance();
            fallController?.ResetFall();

            onRescued?.Invoke();
            Rescued?.Invoke();
        }

        public void SkipToGameOver()
        {
            if (!IsOpen)
                return;

            Expire();
        }

        private void Expire()
        {
            if (!IsOpen)
                return;

            IsOpen = false;

            onExpired?.Invoke();
            Expired?.Invoke();
        }
    }
}
