using UnityEngine;

namespace DontFallGranny.UI
{
    [RequireComponent(typeof(RectTransform))]
    public sealed class SafeAreaPanel : MonoBehaviour
    {
        private RectTransform rectTransform;
        private Rect lastSafeArea;
        private Vector2Int lastScreenSize;

        private void Awake()
        {
            rectTransform = GetComponent<RectTransform>();
            Apply();
        }

        private void Update()
        {
            if (lastSafeArea != Screen.safeArea ||
                lastScreenSize.x != Screen.width ||
                lastScreenSize.y != Screen.height)
            {
                Apply();
            }
        }

        private void Apply()
        {
            Rect safe = Screen.safeArea;
            lastSafeArea = safe;
            lastScreenSize = new Vector2Int(Screen.width, Screen.height);

            if (Screen.width <= 0 || Screen.height <= 0)
                return;

            Vector2 min = safe.position;
            Vector2 max = safe.position + safe.size;

            min.x /= Screen.width;
            min.y /= Screen.height;
            max.x /= Screen.width;
            max.y /= Screen.height;

            rectTransform.anchorMin = min;
            rectTransform.anchorMax = max;
            rectTransform.offsetMin = Vector2.zero;
            rectTransform.offsetMax = Vector2.zero;
        }
    }
}
