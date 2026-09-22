using System;
using UnityEngine;

namespace DontFallGranny.Core
{
    public sealed class GameRunLifecycleController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private GameSessionFlowController sessionFlow;
        [SerializeField] private GameRunStateController runState;
        [SerializeField] private BalanceController balance;
        [SerializeField] private FallController fallController;
        [SerializeField] private RecoveryWindowController recoveryWindow;
        [SerializeField] private RescueWindowController rescueWindow;
        [SerializeField] private GrannyRunnerController runner;
        [SerializeField] private RunDataController runData;
        [SerializeField] private RunWorldResetController worldReset;
        [SerializeField] private Rigidbody body;

        private Vector3 spawnPosition;
        private Quaternion spawnRotation;

        public event Action RunPrepared;
        public event Action RunStarted;
        public event Action RunRestarted;

        private void Awake()
        {
            if (sessionFlow == null)
                sessionFlow = FindFirstObjectByType<GameSessionFlowController>();

            if (runState == null)
                runState = GetComponent<GameRunStateController>();

            if (balance == null)
                balance = GetComponent<BalanceController>();

            if (fallController == null)
                fallController = GetComponent<FallController>();

            if (recoveryWindow == null)
                recoveryWindow = GetComponent<RecoveryWindowController>();

            if (rescueWindow == null)
                rescueWindow = GetComponent<RescueWindowController>();

            if (runner == null)
                runner = GetComponent<GrannyRunnerController>();

            if (runData == null)
                runData = GetComponent<RunDataController>();

            if (worldReset == null)
                worldReset = FindFirstObjectByType<RunWorldResetController>();

            if (body == null)
                body = GetComponent<Rigidbody>();

            spawnPosition = transform.position;
            spawnRotation = transform.rotation;
        }

        private void OnEnable()
        {
            if (sessionFlow != null)
                sessionFlow.StateChanged += HandleSessionStateChanged;
        }

        private void OnDisable()
        {
            if (sessionFlow != null)
                sessionFlow.StateChanged -= HandleSessionStateChanged;
        }

        public void PrepareRun()
        {
            ResetCoreState();
            RunPrepared?.Invoke();
        }

        public void StartFreshRun()
        {
            if (sessionFlow != null &&
                sessionFlow.State != GameSessionState.Playing)
            {
                sessionFlow.StartRun();
                return;
            }

            ResetCoreState();
            RunStarted?.Invoke();
        }

        public void RestartRun()
        {
            if (sessionFlow != null &&
                sessionFlow.State != GameSessionState.Playing)
            {
                sessionFlow.StartRun();
                return;
            }

            ResetCoreState();
            RunRestarted?.Invoke();
        }

        public void ReturnHome()
        {
            ResetCoreState();
            sessionFlow?.OpenHome();
        }

        private void HandleSessionStateChanged(
            GameSessionState previous,
            GameSessionState current
        )
        {
            if (current == GameSessionState.Playing &&
                previous != GameSessionState.Playing)
            {
                ResetCoreState();
                RunStarted?.Invoke();
            }
        }

        private void ResetCoreState()
        {
            recoveryWindow?.CancelRecovery();
            rescueWindow?.ResetWindow();
            balance?.ResetBalance();
            fallController?.ResetFall();
            runState?.SetState(GameRunState.Running);
            runner?.ResetRunMotion();

            transform.SetPositionAndRotation(spawnPosition, spawnRotation);

            if (body != null)
            {
                body.linearVelocity = Vector3.zero;
                body.angularVelocity = Vector3.zero;
            }

            runData?.ResetRunData();
            worldReset?.ResetWorld();
        }
    }
}
