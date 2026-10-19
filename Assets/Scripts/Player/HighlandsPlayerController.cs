using UnityEngine;

/// <summary>First-person movement for the Project Highlands prototype.</summary>
[RequireComponent(typeof(CharacterController))]
public class HighlandsPlayerController : MonoBehaviour
{
    [Header("Movement")]
    [SerializeField] private float walkSpeed = 5f;
    [SerializeField] private float sprintSpeed = 8f;
    [SerializeField] private float jumpHeight = 1.35f;
    [SerializeField] private float gravity = -22f;

    [Header("Look")]
    [SerializeField] private Transform playerCamera;
    [SerializeField] private float mouseSensitivity = 2f;
    [SerializeField] private float lookLimit = 85f;

    private CharacterController controller;
    private float verticalVelocity;
    private float pitch;
    private bool controlsEnabled = true;

    private void Awake()
    {
        controller = GetComponent<CharacterController>();
        if (playerCamera == null && Camera.main != null)
            playerCamera = Camera.main.transform;
    }

    private void Start() => SetCursorLocked(true);

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.Escape))
        {
            controlsEnabled = !controlsEnabled;
            SetCursorLocked(controlsEnabled);
        }
        if (!controlsEnabled) return;
        Look();
        Move();
    }

    private void Look()
    {
        if (playerCamera == null || Cursor.lockState != CursorLockMode.Locked) return;
        float mouseX = Input.GetAxis("Mouse X") * mouseSensitivity;
        float mouseY = Input.GetAxis("Mouse Y") * mouseSensitivity;
        transform.Rotate(Vector3.up * mouseX);
        pitch = Mathf.Clamp(pitch - mouseY, -lookLimit, lookLimit);
        playerCamera.localRotation = Quaternion.Euler(pitch, 0f, 0f);
    }

    private void Move()
    {
        float x = Input.GetAxisRaw("Horizontal");
        float z = Input.GetAxisRaw("Vertical");
        Vector3 direction = (transform.right * x + transform.forward * z).normalized;
        float speed = Input.GetKey(KeyCode.LeftShift) ? sprintSpeed : walkSpeed;

        if (controller.isGrounded && verticalVelocity < 0f) verticalVelocity = -2f;
        if (controller.isGrounded && Input.GetButtonDown("Jump"))
            verticalVelocity = Mathf.Sqrt(jumpHeight * -2f * gravity);

        verticalVelocity += gravity * Time.deltaTime;
        Vector3 velocity = direction * speed;
        velocity.y = verticalVelocity;
        controller.Move(velocity * Time.deltaTime);
    }

    private void SetCursorLocked(bool locked)
    {
        Cursor.lockState = locked ? CursorLockMode.Locked : CursorLockMode.None;
        Cursor.visible = !locked;
    }
}
