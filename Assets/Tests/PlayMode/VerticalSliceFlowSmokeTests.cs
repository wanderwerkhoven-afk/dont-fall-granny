using System.Collections;
using DontFallGranny.Core;
using DontFallGranny.Input;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

namespace DontFallGranny.Tests
{
    public sealed class VerticalSliceFlowSmokeTests
    {
        private GameObject sessionObject;
        private GameObject granny;
        private GameSessionFlowController session;
        private GameRunStateController runState;
        private Rigidbody body;

        [SetUp]
        public void SetUp()
        {
            sessionObject = new GameObject("Session");
            session = sessionObject.AddComponent<GameSessionFlowController>();

            granny = new GameObject("Granny");
            body = granny.AddComponent<Rigidbody>();
            body.useGravity = false;

            granny.AddComponent<BalanceController>();
            runState = granny.AddComponent<GameRunStateController>();
            granny.AddComponent<GrannyInputRouter>();
            granny.AddComponent<GrannyRunnerController>();
        }

        [TearDown]
        public void TearDown()
        {
            Object.DestroyImmediate(granny);
            Object.DestroyImmediate(sessionObject);
        }

        [UnityTest]
        public IEnumerator Home_BlocksForwardMovement()
        {
            yield return new WaitForFixedUpdate();

            Assert.AreEqual(GameSessionState.Home, session.State);
            Assert.AreEqual(0f, body.linearVelocity.z, 0.001f);
        }

        [UnityTest]
        public IEnumerator Play_EnablesForwardMovement()
        {
            session.StartRun();

            yield return new WaitForFixedUpdate();

            Assert.Greater(body.linearVelocity.z, 0f);
        }

        [UnityTest]
        public IEnumerator Recovering_SlowsButDoesNotStopMovement()
        {
            session.StartRun();
            runState.SetState(GameRunState.Running);

            yield return new WaitForFixedUpdate();
            float runningSpeed = body.linearVelocity.z;

            runState.SetState(GameRunState.Recovering);
            yield return new WaitForFixedUpdate();
            float recoveringSpeed = body.linearVelocity.z;

            Assert.Greater(recoveringSpeed, 0f);
            Assert.Less(recoveringSpeed, runningSpeed);
        }

        [UnityTest]
        public IEnumerator RescueAndGameOver_BlockMovement()
        {
            session.StartRun();

            runState.SetState(GameRunState.Rescue);
            yield return new WaitForFixedUpdate();
            Assert.AreEqual(0f, body.linearVelocity.z, 0.001f);

            runState.SetState(GameRunState.GameOver);
            yield return new WaitForFixedUpdate();
            Assert.AreEqual(0f, body.linearVelocity.z, 0.001f);
        }
    }
}
