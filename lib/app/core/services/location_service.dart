import 'package:geolocator/geolocator.dart';
import '../error/failures.dart';

/// Service to handle location operations
class LocationService {
  /// Check if location services are enabled
  Future<bool> isLocationServiceEnabled() async {
    return await Geolocator.isLocationServiceEnabled();
  }

  /// Check location permission status
  Future<LocationPermission> checkPermission() async {
    return await Geolocator.checkPermission();
  }

  /// Request location permission
  Future<LocationPermission> requestPermission() async {
    return await Geolocator.requestPermission();
  }

  /// Get current location
  /// Returns a Position or throws appropriate Failure
  Future<Position> getCurrentLocation() async {
    // Check if location services are enabled
    final serviceEnabled = await isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw const LocationFailure(
        'Les services de localisation sont désactivés.\nActivez-les dans les paramètres.',
      );
    }

    // Check permission
    LocationPermission permission = await checkPermission();
    
    if (permission == LocationPermission.denied) {
      permission = await requestPermission();
      if (permission == LocationPermission.denied) {
        throw const LocationPermissionFailure(
          'Permission de localisation refusée.\nAutorisez l\'accès dans les paramètres.',
        );
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw const LocationPermissionFailure(
        'Permission de localisation refusée définitivement.\nAutorisez l\'accès dans les paramètres de l\'application.',
      );
    }

    // Get location
    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
    } catch (e) {
      throw LocationFailure(
        'Impossible d\'obtenir votre position.\n${e.toString()}',
      );
    }
  }

  /// Get last known location
  Future<Position?> getLastKnownLocation() async {
    try {
      return await Geolocator.getLastKnownPosition();
    } catch (e) {
      return null;
    }
  }

  /// Calculate distance between two coordinates (in meters)
  double calculateDistance({
    required double startLatitude,
    required double startLongitude,
    required double endLatitude,
    required double endLongitude,
  }) {
    return Geolocator.distanceBetween(
      startLatitude,
      startLongitude,
      endLatitude,
      endLongitude,
    );
  }

  /// Open location settings
  Future<bool> openLocationSettings() async {
    return await Geolocator.openLocationSettings();
  }

  /// Open app settings
  Future<bool> openAppSettings() async {
    return await Geolocator.openAppSettings();
  }
}