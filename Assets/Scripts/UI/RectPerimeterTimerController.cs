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

        private void Awake()
        {
            ConfigureEdges();
        }

#if UNITY_EDITOR
        private void OnValidate()
        {
            ConfigureEdges();
        }
#endif

        public void SetProgress(float normalized)
        {
            normalized = Mathf.Clamp01(normalized);
            float scaled = normalized * 4f;

            SetFill(top, Mathf.Clamp01(scaled));
            SetFill(right, Mathf.Clamp01(scaled - 1f));
            SetFill(bottom, Mathf.Clamp01(scaled - 2f));
            SetFill(left, Mathf.Clamp01(scaled - 3f));
        }

        private void ConfigureEdges()
        {
            ConfigureHorizontal(top, Image.OriginHorizontal.Left);
            ConfigureVertical(right, Image.OriginVertical.Bottom);
            ConfigureHorizontal(bottom, Image.OriginHorizontal.Right);
            ConfigureVertical(left, Image.OriginVertical.Top);
        }

        private static void ConfigureHorizontal(
            Image image,
            Image.OriginHorizontal origin
        )
        {
            if (image == null)
                return;

            image.type = Image.Type.Filled;
            image.fillMethod = Image.FillMethod.Horizontal;
            image.fillOrigin = (int)origin;
            image.fillClockwise = true;
        }

        private static void ConfigureVertical(
            Image image,
            Image.OriginVertical origin
        )
        {
            if (image == null)
                return;

            image.type = Image.Type.Filled;
            image.fillMethod = Image.FillMethod.Vertical;
            image.fillOrigin = (int)origin;
            image.fillClockwise = true;
        }

        private static void SetFill(Image image, float value)
        {
            if (image != null)
                image.fillAmount = value;
        }
    }
}
