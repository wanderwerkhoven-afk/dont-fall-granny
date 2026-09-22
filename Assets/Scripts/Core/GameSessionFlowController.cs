using System;
using UnityEngine;

namespace DontFallGranny.Core
{
    public enum GameSessionState
    {
        Home,
        Loadout,
        Playing
    }

    public sealed class GameSessionFlowController : MonoBehaviour
    {
        [SerializeField] private GameSessionState initialState = GameSessionState.Home;

        public GameSessionState State { get; private set; }
        public event Action<GameSessionState, GameSessionState> StateChanged;

        private void Awake()
        {
            State = initialState;
        }

        public void OpenHome()
        {
            SetState(GameSessionState.Home);
        }

        public void OpenLoadout()
        {
            SetState(GameSessionState.Loadout);
        }

        public void StartRun()
        {
            SetState(GameSessionState.Playing);
        }

        private void SetState(GameSessionState next)
        {
            if (State == next)
                return;

            GameSessionState previous = State;
            State = next;
            StateChanged?.Invoke(previous, next);
        }
    }
}
