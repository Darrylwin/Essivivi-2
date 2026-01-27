class AppConstants {
  // Prevent instantiation
  AppConstants._();

  // =====================================================
  // API Configuration
  // =====================================================
  static const String baseUrl = 'http://127.0.0.1:8000/api';

  // =====================================================
  // Currency
  // =====================================================
  static const String currency = 'FCFA';
  static const String currencySymbol = 'FCFA';

  // =====================================================
  // Date/Time Formats
  // =====================================================
  static const String dateFormat = 'dd/MM/yyyy';
  static const String timeFormat = 'HH:mm';
  static const String dateTimeFormat = 'dd/MM/yyyy HH:mm';
  static const String displayDateFormat = 'EEEE dd MMMM yyyy';
  static const String displayTimeFormat = 'HH:mm';

  // =====================================================
  // Regex Patterns
  // =====================================================
  static const String emailPattern = r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$';
  static const String phonePattern = r'^\+?[0-9]{8,15}$';

  // Togo phone pattern (more specific)
  static const String togoPhonePattern =
      r'^(90|91|92|93|96|97|98|99|70|79)\d{6}$';
}
