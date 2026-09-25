import { createRoot } from 'react-dom/client';
import DepthCarousel from './DepthCarousel';

const photos = (window.GYM && window.GYM.gallery) || [];
const section = document.getElementById('gallery');

if (photos.length && section) {
  section.hidden = false;
  const items = photos.map((src, i) => ({ image: src, alt: `${window.GYM.name} - photo ${i + 1}` }));
  createRoot(document.getElementById('strip')).render(
    <DepthCarousel
      items={items}
      cardWidth={230}
      cardHeight={300}
      depth={130}
      spread={64}
      tilt={18}
      visibleCards={4}
      falloff={0.16}
      blur={3}
      autoplay={true}
      autoplayDelay={2800}
      loop={true}
      showIndicators={false}
      tint="#000000"
    />
  );
}
