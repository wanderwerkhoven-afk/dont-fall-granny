using UnityEngine;
using UnityEngine.UI;

namespace DontFallGranny.UI
{
    public sealed class RectPerimeterTimerController : MonoBehaviour
    {
        [SerializeField] private Image top;
        [SerializeField] private Image right;
        [SerializeField] private Image bottom;
        [SerializeField] private Image left;

        public void SetProgress(float normalized)
        {
            normalized = Mathf.Clamp01(normalized);
            float scaled = normalized * 4f;

            SetFill(top, Mathf.Clamp01(scaled));
            SetFill(right, Mathf.Clamp01(scaled - 1f));
            SetFill(bottom, Mathf.Clamp01(scaled - 2f));
            SetFill(left, Mathf.Clamp01(scaled - 3f));
        }

        private static void SetFill(Image image, float value)
        {
            if (image == null)
                return;

            image.fillAmount = value;
        }
    }
}
