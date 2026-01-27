import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'app/core/di/service_locator.dart' as di;
import 'app/core/routing/app_router.dart';
import 'app/core/themes/app_theme.dart';
import 'app/features/auth/presentation/bloc/auth_bloc.dart';
import 'app/features/auth/presentation/bloc/auth_event.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await di.initDependencies();
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider<AuthBloc>(
          create: (context) => di.sl<AuthBloc>()
            ..add(const CheckAuthStatus()),
        ),
      ],
      child: MaterialApp.router(
        title: 'ESSIVIVI Distribution',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        routerConfig: AppRouter.createRouter(),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}