export const simulationVertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const simulationFragmentShader = `
uniform sampler2D textureA;
uniform vec2 mouse;
uniform vec2 resolution;
uniform float time;
uniform int frame;

varying vec2 vUv;

const float delta = 1.4;

void main() {

    vec2 uv = vUv;

    if (frame == 0) {
        gl_FragColor = vec4(0.0);
        return;
    }

    vec4 data = texture2D(textureA, uv);

    float pressure = data.x;
    float pVel = data.y;

    vec2 texelSize = 1.0 / resolution;

    float p_right = texture2D(
        textureA,
        uv + vec2(texelSize.x, 0.0)
    ).x;

    float p_left = texture2D(
        textureA,
        uv - vec2(texelSize.x, 0.0)
    ).x;

    float p_up = texture2D(
        textureA,
        uv + vec2(0.0, texelSize.y)
    ).x;

    float p_down = texture2D(
        textureA,
        uv - vec2(0.0, texelSize.y)
    ).x;

    if (uv.x <= texelSize.x)
        p_left = p_right;

    if (uv.x >= 1.0 - texelSize.x)
        p_right = p_left;

    if (uv.y <= texelSize.y)
        p_down = p_up;

    if (uv.y >= 1.0 - texelSize.y)
        p_up = p_down;

    pVel += delta *
        (-2.0 * pressure + p_right + p_left) / 4.0;

    pVel += delta *
        (-2.0 * pressure + p_up + p_down) / 4.0;

    pressure += delta * pVel;

    pVel -= 0.005 * delta * pressure;
    pVel *= 1.0 - 0.002 * delta;
    pressure *= 0.999;

    // Mouse disturbance
    vec2 mouseUV = mouse / resolution;

    if (mouse.x > 0.0) {

        float dist = distance(uv, mouseUV);

        float radius = 0.035;

        if (dist < radius) {

            float strength =
                1.0 - smoothstep(0.0, radius, dist);

            pressure += strength * 1.8;
        }
    }

    gl_FragColor = vec4(
        pressure,
        pVel,
        (p_right - p_left) * 0.5,
        (p_up - p_down) * 0.5
    );
}
`;

export const renderVertexShader = `
varying vec2 vUv;

void main() {

    vUv = uv;

    gl_Position =
        projectionMatrix *
        modelViewMatrix *
        vec4(position, 1.0);
}
`;

export const renderFragmentShader = `
uniform sampler2D textureA;
uniform float time;

varying vec2 vUv;

void main() {

    vec4 data = texture2D(textureA, vUv);

    // Water distortion
    vec2 distortion = data.zw * 0.35;

    // Water color
    vec3 waterColor = vec3(
        0.02,
        0.55,
        0.68
    );

    // Gradient
    float gradient =
        smoothstep(0.0, 1.0, vUv.y);

    waterColor +=
        vec3(0.0, 0.08, 0.10) * gradient;

    // Water light
    vec3 normal = normalize(
        vec3(
            -data.z * 3.0,
            1.0,
            -data.w * 3.0
        )
    );

    vec3 lightDir = normalize(
        vec3(-3.0, 4.0, 3.0)
    );

    float light =
        max(
            dot(normal, lightDir),
            0.0
        );

    // Reflection
    float reflection =
        pow(light, 5.0);

    waterColor +=
        reflection * vec3(
            0.15,
            0.35,
            0.40
        );

    // Ripple brightness
    float ripple =
        smoothstep(
            0.0,
            0.5,
            abs(data.x)
        );

    waterColor +=
        ripple * vec3(
            0.04,
            0.12,
            0.14
        );

    gl_FragColor =
        vec4(waterColor, 1.0);
}
`;