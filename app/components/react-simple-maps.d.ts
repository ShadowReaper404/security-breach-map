declare module "react-simple-maps" {
  import * as React from "react";

  export interface GeographyFeature {
    rsmKey: string;
    [key: string]: unknown;
  }

  export interface GeographiesRenderProps {
    geographies: GeographyFeature[];
    outline: unknown;
    borders: unknown;
  }

  export interface ComposableMapProps
    extends React.SVGAttributes<SVGSVGElement> {
    projection?: string;
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
      rotate?: [number, number, number];
      parallels?: [number, number];
    };
    width?: number;
    height?: number;
    children?: React.ReactNode;
  }

  export interface GeographiesProps {
    geography: string | object;
    parseGeographies?: (features: GeographyFeature[]) => GeographyFeature[];
    children: (props: GeographiesRenderProps) => React.ReactNode;
  }

  interface StateStyle {
    outline?: string;
    fill?: string;
    [key: string]: unknown;
  }

  export interface GeographyProps
    extends Omit<React.SVGProps<SVGPathElement>, "style"> {
    geography: GeographyFeature;
    style?: {
      default?: StateStyle;
      hover?: StateStyle;
      pressed?: StateStyle;
    };
  }

  export interface MarkerProps
    extends Omit<React.SVGProps<SVGGElement>, "onClick"> {
    coordinates: [number, number];
    children?: React.ReactNode;
    onClick?: (event: React.MouseEvent<SVGGElement>) => void;
  }

  export interface LineProps extends React.SVGProps<SVGPathElement> {
    from?: [number, number];
    to?: [number, number];
    coordinates?: [number, number][];
  }

  export const ComposableMap: React.FC<ComposableMapProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
  export const Marker: React.FC<MarkerProps>;
  export const Line: React.FC<LineProps>;
  export const Sphere: React.FC<React.SVGProps<SVGPathElement>>;
  export const Graticule: React.FC<React.SVGProps<SVGPathElement>>;
  export const ZoomableGroup: React.FC<
    React.SVGProps<SVGGElement> & { zoom?: number; center?: [number, number] }
  >;
  export const Annotation: React.FC<{
    subject: [number, number];
    dx?: number;
    dy?: number;
    connectorProps?: React.SVGProps<SVGPathElement>;
    children?: React.ReactNode;
  }>;
}
