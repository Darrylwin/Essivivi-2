class AppConstants {
  // Prevent instantiation
  AppConstants._();

  // =====================================================
  // API Configuration
  // =====================================================
  static const String baseUrl = 'http://127.0.0.1:8000/api';

  // API Endpoints
  static const String authEndpoint = '/auth';
  static const String ordersEndpoint = '/orders';
  static const String deliveriesEndpoint = '/deliveries';
  static const String usersEndpoint = '/users';
  static const String agentsEndpoint = '/agents';
  static const String clientsEndpoint = '/clients';

  // =====================================================
  // Storage Keys (SharedPreferences)
  // =====================================================
  static const String authTokenKey = 'auth_token';
  static const String userIdKey = 'user_id';
  static const String userRoleKey = 'user_role';
  static const String userDataKey = 'user_data';
  static const String isFirstLaunchKey = 'is_first_launch';

  // =====================================================
  // User Roles
  // =====================================================
  static const String roleClient = 'client';
  static const String roleAgent = 'agent';

  // =====================================================
  // GPS Configuration
  // =====================================================
  static const double defaultLatitude = 6.1256; // Lomé
  static const double defaultLongitude = 1.2225; // Lomé
  static const double deliveryValidationRadius = 2.0; // 2 meters (optionnel)
  static const int locationUpdateInterval = 30; // seconds

  // =====================================================
  // Pagination
  // =====================================================
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

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
  // Assets Paths
  // =====================================================
  static const String logoPath = 'assets/images/logo.png';
  static const String placeholderImagePath = 'assets/images/placeholder.png';
  static const String noDataImagePath = 'assets/images/no_data.png';
  static const String errorImagePath = 'assets/images/error.png';

  // =====================================================
  // Regex Patterns
  // =====================================================
  static const String emailPattern = r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$';
  static const String phonePattern = r'^\+?[0-9]{8,15}$';

  // Togo phone pattern (more specific)
  static const String togoPhonePattern =
      r'^(90|91|92|93|96|97|98|99|70|79)\d{6}$';
}
