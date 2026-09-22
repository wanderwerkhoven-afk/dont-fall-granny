using System;
using UnityEngine;

namespace DontFallGranny.Progression
{
    public enum MasteryTrack
    {
        Balance,
        Bravery,
        Chaos
    }

    [Serializable]
    public sealed class MasteryProgress
    {
        public MasteryTrack track;
        public int level = 1;
        public int experience;
    }

    public sealed class MasteryManager : MonoBehaviour
    {
        [SerializeField] private MasteryProgress[] tracks =
        {
            new MasteryProgress { track = MasteryTrack.Balance },
            new MasteryProgress { track = MasteryTrack.Bravery },
            new MasteryProgress { track = MasteryTrack.Chaos }
        };

        public event Action<MasteryTrack, int> LevelUp;

        public void AwardExperience(MasteryTrack track, int amount)
        {
            if (amount <= 0)
                return;

            MasteryProgress progress = Find(track);
            if (progress == null)
                return;

            progress.experience += amount;

            while (progress.experience >= RequiredExperience(progress.level))
            {
                progress.experience -= RequiredExperience(progress.level);
                progress.level++;
                LevelUp?.Invoke(track, progress.level);
            }
        }

        public MasteryProgress GetProgress(MasteryTrack track)
        {
            return Find(track);
        }

        private MasteryProgress Find(MasteryTrack track)
        {
            foreach (MasteryProgress progress in tracks)
            {
                if (progress.track == track)
                    return progress;
            }

            return null;
        }

        private static int RequiredExperience(int level)
        {
            return 100 + ((level - 1) * 50);
        }
    }
}
