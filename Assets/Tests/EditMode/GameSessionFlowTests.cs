using DontFallGranny.Core;
using NUnit.Framework;
using UnityEngine;

namespace DontFallGranny.Tests
{
    public sealed class GameSessionFlowTests
    {
        [Test]
        public void FrontEndFlow_TransitionsHomeLoadoutPlaying()
        {
            var root = new GameObject("SessionFlowTests");
            var flow = root.AddComponent<GameSessionFlowController>();

            Assert.AreEqual(GameSessionState.Home, flow.State);

            flow.OpenLoadout();
            Assert.AreEqual(GameSessionState.Loadout, flow.State);

            flow.StartRun();
            Assert.AreEqual(GameSessionState.Playing, flow.State);

            flow.OpenHome();
            Assert.AreEqual(GameSessionState.Home, flow.State);

            Object.DestroyImmediate(root);
        }
    }
}
