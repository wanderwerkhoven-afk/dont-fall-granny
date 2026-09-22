using DontFallGranny.Core;
using NUnit.Framework;
using UnityEngine;

namespace DontFallGranny.Tests
{
    public sealed class GameTimeControllerTests
    {
        private float originalScale;
        private float originalFixedDelta;
        private GameObject root;

        [SetUp]
        public void SetUp()
        {
            originalScale = Time.timeScale;
            originalFixedDelta = Time.fixedDeltaTime;
            root = new GameObject("GameTimeControllerTests");
        }

        [TearDown]
        public void TearDown()
        {
            Time.timeScale = originalScale;
            Time.fixedDeltaTime = originalFixedDelta;
            Object.DestroyImmediate(root);
        }

        [Test]
        public void CancelWithoutOwnership_DoesNotOverwriteExternalTime()
        {
            var controller = root.AddComponent<GameTimeController>();

            Time.timeScale = 0.65f;
            Time.fixedDeltaTime = 0.013f;

            controller.CancelHitStop();

            Assert.AreEqual(0.65f, Time.timeScale, 0.0001f);
            Assert.AreEqual(0.013f, Time.fixedDeltaTime, 0.0001f);
        }
    }
}
