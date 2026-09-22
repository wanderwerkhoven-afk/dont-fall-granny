using System.Collections;
using DontFallGranny.Core;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

namespace DontFallGranny.Tests
{
    public sealed class RunDataFlowSmokeTests
    {
        private GameObject sessionObject;
        private GameObject granny;
        private GameSessionFlowController session;
        private RunDataController runData;

        [SetUp]
        public void SetUp()
        {
            sessionObject = new GameObject("Session");
            session = sessionObject.AddComponent<GameSessionFlowController>();

            granny = new GameObject("Granny");
            runData = granny.AddComponent<RunDataController>();
        }

        [TearDown]
        public void TearDown()
        {
            Object.DestroyImmediate(granny);
            Object.DestroyImmediate(sessionObject);
        }

        [UnityTest]
        public IEnumerator Distance_UpdatesOnlyWhilePlaying()
        {
            granny.transform.position = new Vector3(0f, 0f, 5f);
            yield return null;

            Assert.AreEqual(0f, runData.DistanceMeters, 0.01f);

            session.StartRun();
            granny.transform.position = new Vector3(0f, 0f, 12f);
            yield return null;

            Assert.Greater(runData.DistanceMeters, 0f);
        }

        [Test]
        public void Coins_AreAddedAndReset()
        {
            runData.AddCoin();
            runData.AddCoin(2);

            Assert.AreEqual(3, runData.Coins);

            runData.ResetRunData();

            Assert.AreEqual(0, runData.Coins);
            Assert.AreEqual(0f, runData.DistanceMeters, 0.001f);
        }

        [UnityTest]
        public IEnumerator BestDistance_PersistsAcrossRunReset()
        {
            session.StartRun();
            granny.transform.position = new Vector3(0f, 0f, 20f);
            yield return null;

            float best = runData.BestDistanceMeters;
            Assert.Greater(best, 0f);

            runData.ResetRunData();

            Assert.AreEqual(best, runData.BestDistanceMeters, 0.001f);
        }
    }
}
