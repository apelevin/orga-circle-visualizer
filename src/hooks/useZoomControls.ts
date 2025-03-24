
import * as d3 from 'd3';

interface UseZoomControlsProps {
  resetZoomFunction: () => void;
}

export const useZoomControls = ({ resetZoomFunction }: UseZoomControlsProps) => {
  const zoomIn = () => {
    const svgElement = document.querySelector('svg');
    if (svgElement) {
      const zoomBehavior = d3.select(svgElement).property("__zoom");
      if (zoomBehavior) {
        const transform = d3.zoomIdentity
          .translate(zoomBehavior.translate()[0], zoomBehavior.translate()[1])
          .scale(zoomBehavior.scale() * 1.2);
        
        d3.select(svgElement)
          .transition()
          .duration(300)
          .call(zoomBehavior.transform, transform);
      }
    }
  };

  const zoomOut = () => {
    const svgElement = document.querySelector('svg');
    if (svgElement) {
      const zoomBehavior = d3.select(svgElement).property("__zoom");
      if (zoomBehavior) {
        const transform = d3.zoomIdentity
          .translate(zoomBehavior.translate()[0], zoomBehavior.translate()[1])
          .scale(zoomBehavior.scale() / 1.2);
        
        d3.select(svgElement)
          .transition()
          .duration(300)
          .call(zoomBehavior.transform, transform);
      }
    }
  };

  return {
    zoomIn,
    zoomOut,
    resetZoom: resetZoomFunction
  };
};
