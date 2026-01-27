import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'dart:async';
import '../../../../core/themes/colors/app_color.dart';
import '../../../../core/widgets/common_widgets.dart';
import '../../../../core/routing/app_router.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';
import '../../../auth/domain/entities/user.dart';

class OtpScreen extends StatefulWidget {
  final String email;
  final bool fromRegistration;

  const OtpScreen({
    super.key,
    required this.email,
    this.fromRegistration = false,
  });

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final List<TextEditingController> _controllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (_) => FocusNode());
  
  Timer? _timer;
  int _remainingSeconds = 120;
  bool _canResend = false;
  bool _isError = false;

  @override
  void initState() {
    super.initState();
    _startTimer();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNodes[0].requestFocus();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (var controller in _controllers) {
      controller.dispose();
    }
    for (var node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _startTimer() {
    _remainingSeconds = 120;
    _canResend = false;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_remainingSeconds > 0) {
          _remainingSeconds--;
        } else {
          _canResend = true;
          timer.cancel();
        }
      });
    });
  }

  String get _timerText {
    final minutes = _remainingSeconds ~/ 60;
    final seconds = _remainingSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  String _getOtpCode() {
    return _controllers.map((c) => c.text).join();
  }

  void _verifyOtp() {
    final otp = _getOtpCode();
    if (otp.length == 6) {
      context.read<AuthBloc>().add(
            VerifyOtpRequested(
              email: widget.email,
              otp: otp,
            ),
          );
    } else {
      setState(() => _isError = true);
    }
  }

  void _resendOtp() {
    if (_canResend) {
      context.read<AuthBloc>().add(ResendOtpRequested(widget.email));
      _startTimer();
      _clearOtpFields();
      setState(() => _isError = false);
    }
  }

  void _clearOtpFields() {
    for (var controller in _controllers) {
      controller.clear();
    }
    _focusNodes[0].requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColor.background,
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthAuthenticated) {
            if (state.user.userType == UserRole.client) {
              context.goToClientHome();
            } else {
              context.goToAgentHome();
            }
          } else if (state is OtpResent) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColor.success,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            );
          } else if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColor.error,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            );
            setState(() => _isError = true);
          }
        },
        builder: (context, state) {
          final isLoading = state is AuthLoading;

          return LoadingOverlay(
            isLoading: isLoading,
            message: 'Vérification en cours...',
            child: CustomScrollView(
              slivers: [
                SliverAppBar(
                  backgroundColor: Colors.transparent,
                  elevation: 0,
                  pinned: true,
                  leading: Container(
                    margin: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColor.white,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.1),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back_rounded,
                          color: AppColor.textPrimary),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                  expandedHeight: 180,
                  flexibleSpace: FlexibleSpaceBar(
                    background: Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            AppColor.primary,
                            Colors.transparent,
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        // Icon
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: const LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                AppColor.primary,
                                AppColor.secondaryLight,
                              ],
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: AppColor.primary.withOpacity(0.3),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.verified_user_rounded,
                            size: 48,
                            color: AppColor.white,
                          ),
                        ),
                        
                        const SizedBox(height: 40),
                        
                        // Title
                        const Text(
                          'Vérification',
                          style: TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w800,
                            color: AppColor.textPrimary,
                            letterSpacing: 0.5,
                          ),
                        ),
                        
                        const SizedBox(height: 16),
                        
                        // Description
                        Text(
                          widget.fromRegistration
                              ? 'Vérifiez votre email pour activer votre compte'
                              : 'Entrez le code à 6 chiffres envoyé à',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 15,
                            color: AppColor.textSecondary,
                            height: 1.5,
                          ),
                        ),
                        
                        const SizedBox(height: 8),
                        
                        // Email
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 20,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            color: AppColor.primary.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: AppColor.primary.withOpacity(0.1),
                              width: 1,
                            ),
                          ),
                          child: Text(
                            widget.email,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              color: AppColor.primary,
                            ),
                          ),
                        ),
                        
                        const SizedBox(height: 48),
                        
                        // OTP input fields
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: List.generate(6, (index) {
                              return AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                width: 56,
                                height: 68,
                                decoration: BoxDecoration(
                                  color: _controllers[index].text.isEmpty
                                      ? AppColor.white
                                      : AppColor.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: _isError
                                        ? AppColor.error
                                        : _focusNodes[index].hasFocus
                                            ? AppColor.primary
                                            : AppColor.border,
                                    width: _focusNodes[index].hasFocus ? 2 : 1.5,
                                  ),
                                  boxShadow: _focusNodes[index].hasFocus
                                      ? [
                                          BoxShadow(
                                            color: AppColor.primary
                                                .withOpacity(0.2),
                                            blurRadius: 8,
                                            offset: const Offset(0, 2),
                                          ),
                                        ]
                                      : [],
                                ),
                                child: Center(
                                  child: TextField(
                                    controller: _controllers[index],
                                    focusNode: _focusNodes[index],
                                    textAlign: TextAlign.center,
                                    keyboardType: TextInputType.number,
                                    maxLength: 1,
                                    style: const TextStyle(
                                      fontSize: 28,
                                      fontWeight: FontWeight.w700,
                                      color: AppColor.textPrimary,
                                      letterSpacing: 2,
                                    ),
                                    decoration: const InputDecoration(
                                      counterText: '',
                                      border: InputBorder.none,
                                    ),
                                    inputFormatters: [
                                      FilteringTextInputFormatter.digitsOnly,
                                    ],
                                    onChanged: (value) {
                                      setState(() => _isError = false);
                                      if (value.isNotEmpty && index < 5) {
                                        _focusNodes[index + 1].requestFocus();
                                      } else if (value.isEmpty && index > 0) {
                                        _focusNodes[index - 1].requestFocus();
                                      }
                                      
                                      if (index == 5 && value.isNotEmpty) {
                                        _verifyOtp();
                                      }
                                    },
                                  ),
                                ),
                              );
                            }),
                          ),
                        ),
                        
                        if (_isError) ...[
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 12,
                            ),
                            decoration: BoxDecoration(
                              color: AppColor.error.withOpacity(0.05),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(
                                color: AppColor.error.withOpacity(0.2),
                              ),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.error_outline_rounded,
                                  color: AppColor.error,
                                  size: 16,
                                ),
                                SizedBox(width: 8),
                                Text(
                                  'Code incomplet ou invalide',
                                  style: TextStyle(
                                    color: AppColor.errorDark,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                        
                        const SizedBox(height: 40),
                        
                        // Timer or resend
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 16,
                          ),
                          decoration: BoxDecoration(
                            color: _canResend
                                ? AppColor.success.withOpacity(0.05)
                                : AppColor.info.withOpacity(0.05),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: _canResend
                                  ? AppColor.success.withOpacity(0.2)
                                  : AppColor.info.withOpacity(0.2),
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                _canResend
                                    ? Icons.check_circle_outline_rounded
                                    : Icons.timer_outlined,
                                size: 20,
                                color: _canResend
                                    ? AppColor.success
                                    : AppColor.info,
                              ),
                              const SizedBox(width: 12),
                              Text(
                                _canResend
                                    ? 'Prêt à renvoyer'
                                    : 'Expire dans $_timerText',
                                style: TextStyle(
                                  color: _canResend
                                      ? AppColor.successDark
                                      : AppColor.info,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                        
                        const SizedBox(height: 40),
                        
                        // Verify button
                        PrimaryButton(
                          text: 'Vérifier le code',
                          onPressed: _verifyOtp,
                          isLoading: isLoading,
                          icon: Icons.verified_rounded,
                        ),
                        
                        const SizedBox(height: 24),
                        
                        // Resend OTP
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Text(
                              'Code non reçu ? ',
                              style: TextStyle(
                                color: AppColor.textSecondary,
                                fontSize: 14,
                              ),
                            ),
                            GestureDetector(
                              onTap: _canResend ? _resendOtp : null,
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 6,
                                ),
                                decoration: BoxDecoration(
                                  color: _canResend
                                      ? AppColor.primary.withOpacity(0.1)
                                      : Colors.transparent,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(
                                  'Renvoyer',
                                  style: TextStyle(
                                    color: _canResend
                                        ? AppColor.primary
                                        : AppColor.textDisabled,
                                    fontWeight: FontWeight.w600,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        
                        const SizedBox(height: 40),
                        
                        // Info message
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                AppColor.warning.withOpacity(0.05),
                                AppColor.warning.withOpacity(0.02),
                              ],
                            ),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: AppColor.warning.withOpacity(0.2),
                              width: 1,
                            ),
                          ),
                          child: const Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(
                                Icons.info_outline_rounded,
                                color: AppColor.warning,
                                size: 20,
                              ),
                              SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Conseil',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: AppColor.warningDark,
                                      ),
                                    ),
                                    SizedBox(height: 4),
                                    Text(
                                      'Vérifiez votre dossier spam ou courrier indésirable si vous ne trouvez pas l\'email.',
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: AppColor.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}