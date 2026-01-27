import 'package:flutter/material.dart';

/// Application color palette - Thème ESSIVIVI (Eau)
class AppColor {
  AppColor._();

  // =====================================================
  // Primary Colors (Bleu - Thème eau)
  // =====================================================
  static const Color primary = Color(0xFF0077BE); // Bleu eau
  static const Color primaryLight = Color(0xFF4DA6E0);
  static const Color primaryDark = Color(0xFF005A8F);
  static const Color primarySoft = Color(0xFFE3F2FD);

  // =====================================================
  // Secondary Colors (Vert - Fraîcheur)
  // =====================================================
  static const Color secondary = Color(0xFF00BFA5);
  static const Color secondaryLight = Color(0xFF5DDEF4);
  static const Color secondaryDark = Color(0xFF008E76);

  // =====================================================
  // Accent Colors
  // =====================================================
  static const Color accent = Color(0xFFFF9800);
  static const Color accentLight = Color(0xFFFFB74D);
  static const Color accentDark = Color(0xFFF57C00);

  // =====================================================
  // Status Colors
  // =====================================================
  static const Color success = Color(0xFF4CAF50);
  static const Color successLight = Color(0xFF81C784);
  static const Color successDark = Color(0xFF388E3C);

  static const Color warning = Color(0xFFFFC107);
  static const Color warningLight = Color(0xFFFFD54F);
  static const Color warningDark = Color(0xFFFFA000);

  static const Color error = Color(0xFFE53935);
  static const Color errorLight = Color(0xFFEF5350);
  static const Color errorDark = Color(0xFFC62828);

  static const Color info = Color(0xFF2196F3);
  static const Color infoLight = Color(0xFF64B5F6);
  static const Color infoDark = Color(0xFF1976D2);

  // =====================================================
  // Order Status Colors
  // =====================================================
  static const Color statusPending = Color(0xFFFF9800);
  static const Color statusAssigned = Color(0xFF2196F3);
  static const Color statusInProgress = Color(0xFF9C27B0);
  static const Color statusDelivered = Color(0xFF4CAF50);
  static const Color statusCancelled = Color(0xFFE53935);

  // =====================================================
  // Neutral Colors
  // =====================================================
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  
  static const Color grey50 = Color(0xFFFAFAFA);
  static const Color grey100 = Color(0xFFF5F5F5);
  static const Color grey200 = Color(0xFFEEEEEE);
  static const Color grey300 = Color(0xFFE0E0E0);
  static const Color grey400 = Color(0xFFBDBDBD);
  static const Color grey500 = Color(0xFF9E9E9E);
  static const Color grey600 = Color(0xFF757575);
  static const Color grey700 = Color(0xFF616161);
  static const Color grey800 = Color(0xFF424242);
  static const Color grey900 = Color(0xFF212121);

  // =====================================================
  // Background Colors
  // =====================================================
  static const Color background = Color(0xFFF8F9FA);
  static const Color surface = Color(0xFFFFFFFF);

  // =====================================================
  // Text Colors
  // =====================================================
  static const Color textPrimary = Color(0xFF212121);
  static const Color textSecondary = Color(0xFF757575);
  static const Color textDisabled = Color(0xFFBDBDBD);
  static const Color textHint = Color(0xFF9E9E9E);

  // =====================================================
  // Border Colors
  // =====================================================
  static const Color border = Color(0xFFE0E0E0);
  static const Color borderDark = Color(0xFFBDBDBD);
  static const Color borderLight = Color(0xFFF5F5F5);

  // =====================================================
  // Divider Colors
  // =====================================================
  static const Color divider = Color(0xFFE0E0E0);

  // =====================================================
  // Shadow Colors
  // =====================================================
  static const Color shadow = Color(0x1F000000);
  static const Color shadowLight = Color(0x0A000000);

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
}