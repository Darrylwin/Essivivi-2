import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'colors/app_color.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,

      // Color Scheme
      colorScheme: const ColorScheme.light(
        primary: AppColor.primary,
        primaryContainer: AppColor.primaryLight,
        secondary: AppColor.secondary,
        secondaryContainer: AppColor.secondaryLight,
        error: AppColor.error,
        surface: AppColor.surface,
        background: AppColor.background,
        onPrimary: AppColor.white,
        onSecondary: AppColor.white,
        onError: AppColor.white,
        onSurface: AppColor.textPrimary,
        onBackground: AppColor.textPrimary,
      ),

      scaffoldBackgroundColor: AppColor.background,

      // AppBar
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: AppColor.textPrimary,
        elevation: 0,
        centerTitle: true,
        systemOverlayStyle: SystemUiOverlayStyle.dark,
        titleTextStyle: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: AppColor.textPrimary,
          letterSpacing: 0.5,
        ),
        iconTheme: IconThemeData(
          color: AppColor.textPrimary,
          size: 24,
        ),
      ),

      // Text Theme
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontSize: 32,
          fontWeight: FontWeight.w800,
          color: AppColor.textPrimary,
          letterSpacing: 0.5,
        ),
        displayMedium: TextStyle(
          fontSize: 28,
          fontWeight: FontWeight.w800,
          color: AppColor.textPrimary,
          letterSpacing: 0.5,
        ),
        displaySmall: TextStyle(
          fontSize: 24,
          fontWeight: FontWeight.w700,
          color: AppColor.textPrimary,
        ),
        headlineMedium: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: AppColor.textPrimary,
        ),
        headlineSmall: TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: AppColor.textPrimary,
        ),
        titleLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColor.textPrimary,
        ),
        titleMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: AppColor.textPrimary,
        ),
        titleSmall: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: AppColor.textPrimary,
        ),
        bodyLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.normal,
          color: AppColor.textPrimary,
          height: 1.5,
        ),
        bodyMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.normal,
          color: AppColor.textPrimary,
          height: 1.5,
        ),
        bodySmall: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.normal,
          color: AppColor.textSecondary,
          height: 1.5,
        ),
        labelLarge: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColor.white,
          letterSpacing: 0.5,
        ),
        labelMedium: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: AppColor.white,
        ),
        labelSmall: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: AppColor.white,
        ),
      ),

      // Card
      cardTheme: CardTheme(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
        color: AppColor.white,
        margin: const EdgeInsets.symmetric(horizontal: 0, vertical: 8),
        shadowColor: Colors.transparent,
      ),

      // Elevated Button
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColor.primary,
          foregroundColor: AppColor.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 18),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
          ),
        ),
      ),

      // Outlined Button
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColor.primary,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 18),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          side: const BorderSide(color: AppColor.primary, width: 1.5),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Text Button
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColor.primary,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),

      // Input Decoration
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColor.white,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 20,
          vertical: 18,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColor.border, width: 1.5),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColor.border, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColor.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColor.error, width: 1.5),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: AppColor.error, width: 2),
        ),
        hintStyle: const TextStyle(
          color: AppColor.textHint,
          fontSize: 14,
          fontWeight: FontWeight.normal,
        ),
        labelStyle: const TextStyle(
          color: AppColor.textSecondary,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
        errorStyle: const TextStyle(
          color: AppColor.error,
          fontSize: 12,
          fontWeight: FontWeight.normal,
        ),
        suffixIconColor: AppColor.textSecondary,
        prefixIconColor: AppColor.textSecondary,
      ),

      // Floating Action Button
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: AppColor.primary,
        foregroundColor: AppColor.white,
        elevation: 4,
        shape: CircleBorder(),
      ),

      // Divider
      dividerTheme: const DividerThemeData(
        color: AppColor.divider,
        thickness: 1,
        space: 0,
      ),

      // Snackbar
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColor.grey800,
        contentTextStyle: const TextStyle(
          color: AppColor.white,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        behavior: SnackBarBehavior.floating,
        elevation: 6,
      ),

      // Progress Indicator
      progressIndicatorTheme: const ProgressIndicatorThemeData(
        color: AppColor.primary,
        linearTrackColor: AppColor.grey200,
      ),

      // Chip
      chipTheme: ChipThemeData(
        backgroundColor: AppColor.grey100,
        selectedColor: AppColor.primary.withOpacity(0.1),
        labelStyle: const TextStyle(
          fontSize: 14,
          color: AppColor.textPrimary,
        ),
        secondaryLabelStyle: const TextStyle(
          fontSize: 14,
          color: AppColor.white,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),

      // Dialog
      dialogTheme: DialogTheme(
        backgroundColor: AppColor.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(24),
        ),
        titleTextStyle: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: AppColor.textPrimary,
        ),
        contentTextStyle: const TextStyle(
          fontSize: 14,
          color: AppColor.textSecondary,
          height: 1.5,
        ),
      ),

      // Bottom Sheet
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColor.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(24),
            topRight: Radius.circular(24),
          ),
        ),
      ),
    );
  }
}