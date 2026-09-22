using System;
using UnityEngine;

namespace DontFallGranny.Core
{
    public enum GameRunState
    {
        Running,
        Recovering,
        Fallen,
        Rescue,
        GameOver
    }

    public sealed class GameRunStateController : MonoBehaviour
    {
        [SerializeField] private GameRunState initialState = GameRunState.Running;

        public GameRunState State { get; private set; }
        public bool AllowsLocomotion => State == GameRunState.Running || State == GameRunState.Recovering;

        public event Action<GameRunState, GameRunState> StateChanged;

        private void Awake()
        {
            State = initialState;
        }

        public void SetState(GameRunState next)
        {
            if (State == next)
                return;

            GameRunState previous = State;
            State = next;
            StateChanged?.Invoke(previous, next);
        }
    }
}
