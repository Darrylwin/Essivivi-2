import 'package:get_it/get_it.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

// auth imports
import '../../features/auth/data/datasources/auth_remote_datasource.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/domain/usecases/login_usecase.dart';
import '../../features/auth/domain/usecases/logout_usecase.dart';
import '../../features/auth/domain/usecases/get_current_user_usecase.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';

// order imports
// Imports
import '../../features/order/data/datasources/order_remote_datasource.dart';
import '../../features/order/data/repositories/order_repository_impl.dart';
import '../../features/order/domain/repositories/order_repository.dart';
import '../../features/order/domain/usecases/create_order_usecase.dart';
import '../../features/order/domain/usecases/get_my_orders_usecase.dart';
import '../../features/order/domain/usecases/get_order_details_usecase.dart';
import '../../features/order/domain/usecases/get_assigned_orders_usecase.dart';
import '../../features/order/presentation/bloc/order_bloc.dart';

final sl = GetIt.instance;

/// Initialize all dependencies
Future<void> initDependencies() async {
  // =====================================================
  // Core
  // =====================================================

  // Dio Client
  sl.registerLazySingleton<Dio>(() {
    final dio = Dio(
      BaseOptions(
        baseUrl: 'https://your-api.com/api', // TODO: Update with your API URL
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Add interceptors
    dio.interceptors.add(LogInterceptor(
      request: true,
      requestBody: true,
      responseBody: true,
      error: true,
    ));

    // Auth interceptor (add token to requests)
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = sl<SharedPreferences>();
          final token = prefs.getString('auth_token');

          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }

          return handler.next(options);
        },
        onError: (error, handler) async {
          // Handle 401 Unauthorized (logout user)
          if (error.response?.statusCode == 401) {
            final prefs = sl<SharedPreferences>();
            await prefs.remove('auth_token');
            // TODO: Navigate to login screen
          }
          return handler.next(error);
        },
      ),
    );

    return dio;
  });

  // Shared Preferences
  final sharedPreferences = await SharedPreferences.getInstance();
  sl.registerLazySingleton<SharedPreferences>(() => sharedPreferences);

// =====================================================
// Features - Auth
// =====================================================

// Bloc
  sl.registerFactory(() => AuthBloc(
        loginUseCase: sl(),
        logoutUseCase: sl(),
        getCurrentUserUseCase: sl(),
      ));

// Use Cases
  sl.registerLazySingleton(() => LoginUseCase(sl()));
  sl.registerLazySingleton(() => LogoutUseCase(sl()));
  sl.registerLazySingleton(() => GetCurrentUserUseCase(sl()));

// Repository
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      sharedPreferences: sl(),
    ),
  );

// Data Source
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(dio: sl()),
  );

// =====================================================
// Features - Order
// =====================================================

// Bloc
  sl.registerFactory(() => OrderBloc(
        createOrderUseCase: sl(),
        getMyOrdersUseCase: sl(),
        getOrderDetailsUseCase: sl(),
        getAssignedOrdersUseCase: sl(),
      ));

// Use Cases
  sl.registerLazySingleton(() => CreateOrderUseCase(sl()));
  sl.registerLazySingleton(() => GetMyOrdersUseCase(sl()));
  sl.registerLazySingleton(() => GetOrderDetailsUseCase(sl()));
  sl.registerLazySingleton(() => GetAssignedOrdersUseCase(sl()));

// Repository
  sl.registerLazySingleton<OrderRepository>(
    () => OrderRepositoryImpl(remoteDataSource: sl()),
  );

// Data Source
  sl.registerLazySingleton<OrderRemoteDataSource>(
    () => OrderRemoteDataSourceImpl(dio: sl()),
  );

  // =====================================================
  // Features - Delivery
  // =====================================================

  // TODO: Add delivery dependencies
}
