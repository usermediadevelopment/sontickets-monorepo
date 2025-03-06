import { Icon, IconProps } from '@chakra-ui/react';
import { SVGProps } from 'react';

const WhatsappIcon = (
  props: JSX.IntrinsicAttributes &
    Omit<SVGProps<SVGSVGElement>, 'as' | 'translate' | keyof IconProps> & {
      htmlTranslate?: 'yes' | 'no' | undefined;
    } & IconProps & { as?: 'svg' | undefined }
) => (
  <Icon viewBox='0 0 200 200' {...props}>
    <defs></defs>
    <g
      style={{
        stroke: 'none',
        strokeWidth: 0,
        strokeDasharray: 'none',
        strokeLinecap: 'butt',
        strokeLinejoin: 'miter',
        strokeMiterlimit: 10,
        fill: 'white',
        fillRule: 'nonzero',
        opacity: 1,
      }}
      transform='translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)'
    >
      <path
        d='M 3.188 90 c -0.791 0 -1.562 -0.313 -2.133 -0.891 c -0.754 -0.762 -1.044 -1.868 -0.761 -2.902 l 5.583 -20.384 c -3.491 -6.472 -5.333 -13.754 -5.34 -21.146 c 0 -0.019 0 -0.038 0 -0.057 C 0.546 20.017 20.571 0 45.175 0 C 57.109 0.005 68.322 4.653 76.75 13.086 c 8.428 8.436 13.066 19.647 13.063 31.57 c -0.011 24.605 -20.034 44.623 -44.637 44.623 c -7.056 -0.002 -14.036 -1.683 -20.283 -4.869 L 3.948 89.902 C 3.697 89.968 3.441 90 3.188 90 z M 25.26 78.213 c 0.498 0 0.992 0.124 1.436 0.366 c 5.636 3.073 12.02 4.698 18.462 4.7 c 21.313 0 38.646 -17.327 38.654 -38.625 c 0.004 -10.32 -4.012 -20.025 -11.307 -27.327 C 65.211 10.027 55.505 6.004 45.174 6 C 23.896 6 6.573 23.298 6.537 44.571 c 0 0.018 0 0.035 0 0.053 c -0.002 6.784 1.781 13.461 5.156 19.309 c 0.401 0.694 0.507 1.52 0.295 2.293 L 7.454 82.78 l 17.046 -4.47 C 24.75 78.245 25.005 78.213 25.26 78.213 z'
        style={{
          stroke: 'none',
          strokeWidth: 1,
          strokeDasharray: 'none',
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter',
          strokeMiterlimit: 10,
          fill: 'rgb(42,181,64)',
          fillRule: 'nonzero',
          opacity: 1,
        }}
        transform=' matrix(1 0 0 1 0 0) '
        strokeLinecap='round'
      />
      <path
        d='M 34.769 27.22 c -0.779 -1.733 -1.6 -1.767 -2.341 -1.798 c -0.607 -0.026 -1.301 -0.024 -1.994 -0.024 c -0.694 0 -1.821 0.26 -2.774 1.301 c -0.954 1.041 -3.642 3.558 -3.642 8.676 c 0 5.119 3.729 10.065 4.248 10.76 c 0.52 0.694 7.198 11.534 17.771 15.703 c 8.789 3.466 10.577 2.776 12.485 2.603 c 1.907 -0.173 6.155 -2.516 7.022 -4.945 c 0.867 -2.429 0.867 -4.511 0.607 -4.946 c -0.26 -0.434 -0.954 -0.694 -1.994 -1.214 c -1.041 -0.52 -6.155 -3.037 -7.109 -3.385 c -0.954 -0.347 -1.648 -0.52 -2.341 0.522 c -0.694 1.04 -2.686 3.383 -3.293 4.077 c -0.607 0.695 -1.214 0.782 -2.254 0.262 c -1.041 -0.522 -4.392 -1.62 -8.367 -5.163 c -3.093 -2.758 -5.181 -6.163 -5.788 -7.205 c -0.607 -1.04 -0.065 -1.604 0.457 -2.123 c 0.467 -0.466 1.041 -1.215 1.561 -1.822 c 0.519 -0.608 0.692 -1.041 1.039 -1.735 c 0.347 -0.694 0.174 -1.302 -0.086 -1.822 C 37.715 34.422 35.693 29.277 34.769 27.22'
        style={{
          stroke: 'none',
          strokeWidth: 1,
          strokeDasharray: 'none',
          strokeLinecap: 'butt',
          strokeLinejoin: 'miter',
          strokeMiterlimit: 10,
          fill: 'rgb(42,181,64)',
          fillRule: 'nonzero',
          opacity: 1,
        }}
        transform=' matrix(1 0 0 1 0 0) '
        strokeLinecap='round'
      />
    </g>
  </Icon>
);

export default WhatsappIcon;
