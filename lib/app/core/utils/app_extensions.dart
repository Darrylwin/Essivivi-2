import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'app_constants.dart';

// =====================================================
// String Extensions
// =====================================================

extension StringExtensions on String {
  /// Capitalize first letter
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }

  /// Capitalize each word
  String capitalizeWords() {
    if (isEmpty) return this;
    return split(' ').map((word) => word.capitalize()).join(' ');
  }

  /// Check if string is a valid email
  bool get isValidEmail {
    final emailRegex = RegExp(AppConstants.emailPattern);
    return emailRegex.hasMatch(this);
  }

  /// Check if string is a valid phone number
  bool get isValidPhone {
    final phoneRegex = RegExp(AppConstants.phonePattern);
    return phoneRegex.hasMatch(this);
  }

  /// Check if string is a valid Togo phone number
  bool get isValidTogoPhone {
    final togoPhoneRegex = RegExp(AppConstants.togoPhonePattern);
    return togoPhoneRegex.hasMatch(this);
  }

  /// Format phone number (add spaces)
  String formatPhone() {
    if (length < 8) return this;
    // Format: 90 00 00 00
    return replaceAllMapped(
      RegExp(r'(\d{2})(\d{2})(\d{2})(\d{2})'),
      (match) => '${match[1]} ${match[2]} ${match[3]} ${match[4]}',
    );
  }

  /// Remove all spaces
  String removeSpaces() {
    return replaceAll(' ', '');
  }

  /// Truncate string with ellipsis
  String truncate(int maxLength, {String ellipsis = '...'}) {
    if (length <= maxLength) return this;
    return '${substring(0, maxLength)}$ellipsis';
  }

  /// Check if string is empty or null
  bool get isEmptyOrNull => trim().isEmpty;

  /// Check if string is not empty
  bool get isNotEmptyOrNull => !isEmptyOrNull;
}

// =====================================================
// DateTime Extensions
// =====================================================

extension DateTimeExtensions on DateTime {
  /// Format to dd/MM/yyyy
  String toFormattedDate() {
    return DateFormat(AppConstants.dateFormat).format(this);
  }

  /// Format to HH:mm
  String toFormattedTime() {
    return DateFormat(AppConstants.timeFormat).format(this);
  }

  /// Format to dd/MM/yyyy HH:mm
  String toFormattedDateTime() {
    return DateFormat(AppConstants.dateTimeFormat).format(this);
  }

  /// Format to display format (EEEE dd MMMM yyyy)
  String toDisplayDate() {
    return DateFormat(AppConstants.displayDateFormat, 'fr_FR').format(this);
  }

  /// Get relative time (il y a X minutes/heures/jours)
  String toRelativeTime() {
    final now = DateTime.now();
    final difference = now.difference(this);

    if (difference.inSeconds < 60) {
      return 'À l\'instant';
    } else if (difference.inMinutes < 60) {
      return 'Il y a ${difference.inMinutes} min';
    } else if (difference.inHours < 24) {
      return 'Il y a ${difference.inHours}h';
    } else if (difference.inDays < 7) {
      return 'Il y a ${difference.inDays}j';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return 'Il y a $weeks sem';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return 'Il y a $months mois';
    } else {
      final years = (difference.inDays / 365).floor();
      return 'Il y a $years an${years > 1 ? 's' : ''}';
    }
  }

  /// Check if date is today
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  /// Check if date is yesterday
  bool get isYesterday {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return year == yesterday.year &&
        month == yesterday.month &&
        day == yesterday.day;
  }

  /// Check if date is in current week
  bool get isThisWeek {
    final now = DateTime.now();
    final startOfWeek = now.subtract(Duration(days: now.weekday - 1));
    return isAfter(startOfWeek);
  }

  /// Get day name (Lundi, Mardi, etc.)
  String get dayName {
    return DateFormat('EEEE', 'fr_FR').format(this);
  }

  /// Get month name (Janvier, Février, etc.)
  String get monthName {
    return DateFormat('MMMM', 'fr_FR').format(this);
  }
}

// =====================================================
// Number Extensions
// =====================================================

extension IntExtensions on int {
  /// Format number with currency (ex: 25000 → "25 000 FCFA")
  String toCurrency() {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return '${formatter.format(this)} ${AppConstants.currencySymbol}';
  }

  /// Format number with spaces (ex: 25000 → "25 000")
  String toFormattedString() {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return formatter.format(this);
  }

  /// Convert to percentage string
  String toPercentage({int decimals = 0}) {
    return '${toStringAsFixed(decimals)}%';
  }
}

extension DoubleExtensions on double {
  /// Format double with currency
  String toCurrency({int decimals = 0}) {
    final formatter = NumberFormat('#,###', 'fr_FR');
    return '${formatter.format(this.round())} ${AppConstants.currencySymbol}';
  }

  /// Format double with decimals
  String toFormattedString({int decimals = 2}) {
    return toStringAsFixed(decimals);
  }

  /// Convert to percentage string
  String toPercentage({int decimals = 1}) {
    return '${toStringAsFixed(decimals)}%';
  }
}

// =====================================================
// BuildContext Extensions
// =====================================================

extension BuildContextExtensions on BuildContext {
  /// Get screen size
  Size get screenSize => MediaQuery.of(this).size;

  /// Get screen width
  double get screenWidth => screenSize.width;

  /// Get screen height
  double get screenHeight => screenSize.height;

  /// Check if screen is small (<600)
  bool get isSmallScreen => screenWidth < 600;

  /// Check if screen is medium (600-900)
  bool get isMediumScreen => screenWidth >= 600 && screenWidth < 900;

  /// Check if screen is large (>=900)
  bool get isLargeScreen => screenWidth >= 900;

  /// Get theme
  ThemeData get theme => Theme.of(this);

  /// Get text theme
  TextTheme get textTheme => theme.textTheme;

  /// Get color scheme
  ColorScheme get colorScheme => theme.colorScheme;

  /// Show snackbar
  void showSnackBar(
    String message, {
    Duration duration = const Duration(seconds: 3),
    SnackBarAction? action,
    Color? backgroundColor,
  }) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: duration,
        action: action,
        backgroundColor: backgroundColor,
      ),
    );
  }

  /// Show success snackbar
  void showSuccessSnackBar(String message) {
    showSnackBar(message, backgroundColor: Colors.green);
  }

  /// Show error snackbar
  void showErrorSnackBar(String message) {
    showSnackBar(message, backgroundColor: Colors.red);
  }

  /// Show loading dialog
  void showLoadingDialog() {
    showDialog(
      context: this,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(),
      ),
    );
  }

  /// Hide loading dialog
  void hideLoadingDialog() {
    Navigator.of(this).pop();
  }

  /// Show confirmation dialog
  Future<bool?> showConfirmDialog({
    required String title,
    required String message,
    String confirmText = 'Confirmer',
    String cancelText = 'Annuler',
  }) {
    return showDialog<bool>(
      context: this,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(cancelText),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(confirmText),
          ),
        ],
      ),
    );
  }
}

// =====================================================
// List Extensions
// =====================================================

extension ListExtensions<T> on List<T> {
  /// Check if list is empty or null
  bool get isEmptyOrNull => isEmpty;

  /// Check if list is not empty
  bool get isNotEmptyOrNull => isNotEmpty;

  /// Get first element or null
  T? get firstOrNull => isNotEmpty ? first : null;

  /// Get last element or null
  T? get lastOrNull => isNotEmpty ? last : null;

  /// Separate list with dividers
  List<Widget> separateWith(Widget separator) {
    if (isEmpty) return [];
    
    final List<Widget> result = [];
    for (int i = 0; i < length; i++) {
      if (this[i] is Widget) {
        result.add(this[i] as Widget);
      }
      if (i < length - 1) {
        result.add(separator);
      }
    }
    return result;
  }
}

// =====================================================
// Widget Extensions
// =====================================================

extension WidgetExtensions on Widget {
  /// Add padding
  Widget withPadding(EdgeInsets padding) {
    return Padding(padding: padding, child: this);
  }

  /// Add symmetric padding
  Widget withPaddingSymmetric({double horizontal = 0, double vertical = 0}) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: horizontal, vertical: vertical),
      child: this,
    );
  }

  /// Add all-side padding
  Widget withPaddingAll(double padding) {
    return Padding(padding: EdgeInsets.all(padding), child: this);
  }

  /// Add margin (wrapped in Container)
  Widget withMargin(EdgeInsets margin) {
    return Container(margin: margin, child: this);
  }

  /// Make widget expanded
  Widget get expanded => Expanded(child: this);

  /// Make widget flexible
  Widget flexible({int flex = 1}) => Flexible(flex: flex, child: this);

  /// Center widget
  Widget get centered => Center(child: this);

  /// Align widget
  Widget align(Alignment alignment) => Align(alignment: alignment, child: this);
}