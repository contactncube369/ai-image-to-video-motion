import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyMotionIntensity,
  getAspectRatioDimensions,
  calculateEstimatedProcessingTime,
  calculateCameraTransform,
} from './motionMath';

test('classifyMotionIntensity correctly categorizes intensity ranges', () => {
  assert.equal(classifyMotionIntensity(0).label, 'Subtle');
  assert.equal(classifyMotionIntensity(15).label, 'Subtle');
  assert.equal(classifyMotionIntensity(20).label, 'Subtle');

  assert.equal(classifyMotionIntensity(21).label, 'Natural');
  assert.equal(classifyMotionIntensity(35).label, 'Natural');
  assert.equal(classifyMotionIntensity(45).label, 'Natural');

  assert.equal(classifyMotionIntensity(46).label, 'Dynamic');
  assert.equal(classifyMotionIntensity(60).label, 'Dynamic');
  assert.equal(classifyMotionIntensity(70).label, 'Dynamic');

  assert.equal(classifyMotionIntensity(71).label, 'Highly Expressive');
  assert.equal(classifyMotionIntensity(90).label, 'Highly Expressive');
  assert.equal(classifyMotionIntensity(100).label, 'Highly Expressive');
  assert.ok(classifyMotionIntensity(85).warning, 'Expected warning for high intensity');
});

test('getAspectRatioDimensions produces accurate dimensions for 720p, 1080p, and 4k', () => {
  const widescreen720 = getAspectRatioDimensions('16:9', '720p');
  assert.equal(widescreen720.width, 1280);
  assert.equal(widescreen720.height, 720);

  const widescreen1080 = getAspectRatioDimensions('16:9', '1080p');
  assert.equal(widescreen1080.width, 1920);
  assert.equal(widescreen1080.height, 1080);

  const widescreen4k = getAspectRatioDimensions('16:9', '4k');
  assert.equal(widescreen4k.width, 3840);
  assert.equal(widescreen4k.height, 2160);

  const vertical720 = getAspectRatioDimensions('9:16', '720p');
  assert.equal(vertical720.width, 720);
  assert.equal(vertical720.height, 1280);

  const square4k = getAspectRatioDimensions('1:1', '4k');
  assert.equal(square4k.width, 2160);
  assert.equal(square4k.height, 2160);
});

test('calculateEstimatedProcessingTime scales with resolution, quality, and duration', () => {
  const draftEst = calculateEstimatedProcessingTime(5, '720p', 'draft', 1);
  const standardEst = calculateEstimatedProcessingTime(5, '720p', 'standard', 1);
  const highEst = calculateEstimatedProcessingTime(5, '1080p', 'high', 1);

  assert.ok(draftEst < standardEst, 'Draft should be faster than standard');
  assert.ok(highEst > standardEst, '1080p high quality should take longer than standard');
  assert.ok(highEst >= 6 && highEst <= 180, 'Must stay within reasonable bounds');
});

test('calculateCameraTransform returns valid interpolation transforms', () => {
  const staticStart = calculateCameraTransform('static', 0, 50);
  const staticEnd = calculateCameraTransform('static', 1, 50);
  assert.equal(staticStart.scale, 1.0);
  assert.equal(staticEnd.scale, 1.0);

  const zoomStart = calculateCameraTransform('slow_zoom_in', 0, 60);
  const zoomEnd = calculateCameraTransform('slow_zoom_in', 1, 60);
  assert.equal(zoomStart.scale, 1.0);
  assert.ok(zoomEnd.scale > 1.0, 'slow_zoom_in must scale up at completion');

  const panLeftEnd = calculateCameraTransform('pan_left', 1, 60);
  assert.ok(panLeftEnd.translateX < 0, 'pan_left must translate negative along X');
});
