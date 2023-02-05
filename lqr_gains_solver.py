import numpy as np
from scipy.linalg import solve_continuous_are, inv

# if they are not installed already,
# install scipy and numpy with `pip install -r requirements.txt`

def lqr(A, B, Q, R):
    # first, try to solve the ricatti equation
    P = np.matrix(solve_continuous_are(A, B, Q, R))
    # compute the LQR gain
    K = np.matrix(inv(R) * (B.T * P))
    return K


g = 9.81
l = 1
M = 0.5
m = 0.3
mu = 0.01

a22 = -mu * (M + m) * g / 2 / M
a23 = -m * g / 2 / M

a42 = (mu * (M + m) * g) / 2 / M / l
a43 = (2 * M * g + m * g) / 2 / M / l

A = np.matrix([[0, 1, 0, 0], [0, a22, a23, 0], [0, 0, 0, 1], [0, a42, a43, 0]])

B = np.matrix(
    [
        [0],
        [1 / 2 / M],
        [0],
        [-1 / M / 2 / l],
    ]
)

Q = np.matrix(
    [
        [100, 0, 0, 0],
        [0, 20, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ]
)

R = np.matrix([[1]])

K = lqr(A, B, Q, R)

print("K", K.tolist()[0])