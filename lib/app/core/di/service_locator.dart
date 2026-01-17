import 'package:get_it/get_it.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

// TODO: Import your features here when created
// import 'package:your_app/features/auth/data/datasources/auth_remote_datasource.dart';
// import 'package:your_app/features/auth/data/repositories/auth_repository_impl.dart';
// import 'package:your_app/features/auth/domain/repositories/auth_repository.dart';
// import 'package:your_app/features/auth/domain/usecases/login_usecase.dart';
// import 'package:your_app/features/auth/presentation/bloc/auth_bloc.dart';

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
  
  // TODO: Uncomment when you create auth feature
  
  // Bloc
  // sl.registerFactory(() => AuthBloc(
  //   loginUseCase: sl(),
  //   logoutUseCase: sl(),
  // ));

  // Use Cases
  // sl.registerLazySingleton(() => LoginUseCase(sl()));
  // sl.registerLazySingleton(() => LogoutUseCase(sl()));

  // Repository
  // sl.registerLazySingleton<AuthRepository>(
  //   () => AuthRepositoryImpl(remoteDataSource: sl()),
  // );

  // Data Source
  // sl.registerLazySingleton<AuthRemoteDataSource>(
  //   () => AuthRemoteDataSourceImpl(dio: sl()),
  // );

  // =====================================================
  // Features - Order
  // =====================================================
  
  // TODO: Add order dependencies

  // =====================================================
  // Features - Delivery
  // =====================================================
  
  // TODO: Add delivery dependencies
}