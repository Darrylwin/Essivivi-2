import 'package:flutter/material.dart';

/// Application color palette - Thème ESSIVIVI (Eau)
class AppColor {
  AppColor._();

  // =====================================================
  // Primary Colors (Bleu - Thème eau)
  // =====================================================
  static const Color primary = Color(0xFF0077BE); // Bleu eau profond
  static const Color primaryLight = Color(0xFF4DA6E0); // Bleu ciel
  static const Color primaryDark = Color(0xFF005A8F); // Bleu marine
  static const Color primarySoft = Color(0xFFE3F2FD); // Bleu très clair

  // =====================================================
  // Secondary Colors (Vert - Fraîcheur)
  // =====================================================
  static const Color secondary = Color(0xFF00BFA5); // Vert eau turquoise
  static const Color secondaryLight = Color(0xFF5DDEF4); // Cyan clair
  static const Color secondaryDark = Color(0xFF008E76); // Vert océan profond

  // =====================================================
  // Accent Colors
  // =====================================================
  static const Color accent = Color(0xFFFF9800); // Orange vif
  static const Color accentLight = Color(0xFFFFB74D); // Orange pâle
  static const Color accentDark = Color(0xFFF57C00); // Orange foncé

  // =====================================================
  // Status Colors
  // =====================================================
  static const Color success = Color(0xFF4CAF50); // Vert succès
  static const Color successLight = Color(0xFF81C784); // Vert clair
  static const Color successDark = Color(0xFF388E3C); // Vert foncé

  static const Color warning = Color(0xFFFFC107); // Jaune avertissement
  static const Color warningLight = Color(0xFFFFD54F); // Jaune clair
  static const Color warningDark = Color(0xFFFFA000); // Jaune foncé

  static const Color error = Color(0xFFE53935); // Rouge erreur
  static const Color errorLight = Color(0xFFEF5350); // Rouge clair
  static const Color errorDark = Color(0xFFC62828); // Rouge foncé

  static const Color info = Color(0xFF2196F3); // Bleu info
  static const Color infoLight = Color(0xFF64B5F6); // Bleu clair
  static const Color infoDark = Color(0xFF1976D2); // Bleu foncé

  // =====================================================
  // Order Status Colors
  // =====================================================
  static const Color statusPending = Color(0xFFFF9800); // Orange
  static const Color statusAssigned = Color(0xFF2196F3); // Bleu
  static const Color statusInProgress = Color(0xFF9C27B0); // Violet
  static const Color statusDelivered = Color(0xFF4CAF50); // Vert
  static const Color statusCancelled = Color(0xFFE53935); // Rouge

  // =====================================================
  // Neutral Colors
  // =====================================================
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  
  static const Color grey50 = Color(0xFFFAFAFA); // Fond très clair
  static const Color grey100 = Color(0xFFF5F5F5); // Fond clair
  static const Color grey200 = Color(0xFFEEEEEE); // Bordures claires
  static const Color grey300 = Color(0xFFE0E0E0); // Bordures
  static const Color grey400 = Color(0xFFBDBDBD); // Texte désactivé
  static const Color grey500 = Color(0xFF9E9E9E); // Texte secondaire
  static const Color grey600 = Color(0xFF757575); // Texte tertiaire
  static const Color grey700 = Color(0xFF616161); // Texte principal foncé
  static const Color grey800 = Color(0xFF424242); // Arrière-plan sombre
  static const Color grey900 = Color(0xFF212121); // Texte principal

  // =====================================================
  // Background Colors
  // =====================================================
  static const Color background = Color(0xFFF8F9FA); // Arrière-plan général
  static const Color surface = Color(0xFFFFFFFF); // Surfaces, cartes
  static const Color onSurface = Color(0xFF000000); // Sur les surfaces

  // =====================================================
  // Text Colors
  // =====================================================
  static const Color textPrimary = Color(0xFF212121); // Texte principal
  static const Color textSecondary = Color(0xFF757575); // Texte secondaire
  static const Color textDisabled = Color(0xFFBDBDBD); // Texte désactivé
  static const Color textHint = Color(0xFF9E9E9E); // Placeholders

  // =====================================================
  // Border Colors
  // =====================================================
  static const Color border = Color(0xFFE0E0E0); // Bordures par défaut
  static const Color borderDark = Color(0xFFBDBDBD); // Bordures sombres
  static const Color borderLight = Color(0xFFF5F5F5); // Bordures claires
  static const Color borderFocused = Color(0xFF0077BE); // Bordure focus

  // =====================================================
  // Divider Colors
  // =====================================================
  static const Color divider = Color(0xFFE0E0E0); // Séparateurs

  // =====================================================
  // Shadow Colors
  // =====================================================
  static const Color shadow = Color(0x1F000000); // Ombre standard
  static const Color shadowLight = Color(0x0A000000); // Ombre légère
  static const Color shadowDark = Color(0x3D000000); // Ombre foncée

  // =====================================================
  // Gradient Colors
  // =====================================================
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, primaryLight],
  );

  static const LinearGradient secondaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [secondary, secondaryLight],
  );

  static const LinearGradient successGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [success, successLight],
  );

  static const LinearGradient accentGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [accent, accentLight],
  );

  static const LinearGradient errorGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [error, errorLight],
  );

  // =====================================================
  // Glassmorphism Colors
  // =====================================================
  static const Color glassWhite = Color(0x20FFFFFF);
  static const Color glassDark = Color(0x20000000);
  static const Color glassPrimary = Color(0x200077BE);
  static const Color glassSecondary = Color(0x2000BFA5);

  // =====================================================
  // Button States
  // =====================================================
  static const Color buttonHover = Color(0x1A0077BE);
  static const Color buttonPressed = Color(0x330077BE);
  static const Color buttonDisabled = Color(0xFFE0E0E0);

  // =====================================================
  // Overlay Colors
  // =====================================================
  static const Color overlayDark = Color(0xCC000000); // Overlay sombre
  static const Color overlayLight = Color(0x33FFFFFF); // Overlay clair
  static const Color overlayPrimary = Color(0x1A0077BE); // Overlay primaire

  // =====================================================
  // Special Effects
  // =====================================================
  static const Color shimmerBase = Color(0xFFE0E0E0);
  static const Color shimmerHighlight = Color(0xFFF5F5F5);
}