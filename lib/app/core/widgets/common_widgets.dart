import 'dart:math';

import 'package:flutter/material.dart';
import '../themes/colors/app_color.dart';

/// Loading overlay widget with enhanced design
class LoadingOverlay extends StatelessWidget {
  final bool isLoading;
  final Widget child;
  final String? message;

  const LoadingOverlay({
    super.key,
    required this.isLoading,
    required this.child,
    this.message,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,
        if (isLoading)
          Container(
            color: Colors.black.withOpacity(0.6),
            child: Center(
              child: Container(
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  color: AppColor.surface,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.15),
                      blurRadius: 32,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const CircularProgressIndicator.adaptive(
                      valueColor: AlwaysStoppedAnimation<Color>(
                        AppColor.primary,
                      ),
                      strokeWidth: 3,
                    ),
                    if (message != null) ...[
                      const SizedBox(height: 16),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          message!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColor.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}

/// Elegant text field with modern design
class CustomTextField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String? hint;
  final IconData? icon;
  final bool obscureText;
  final TextInputType? keyboardType;
  final String? Function(String?)? validator;
  final Widget? suffix;
  final int? maxLines;
  final bool hasBorder;
  final Color? backgroundColor;
  final void Function(String)? onChanged;
  final bool enabled;

  const CustomTextField({
    super.key,
    required this.controller,
    required this.label,
    this.hint,
    this.icon,
    this.obscureText = false,
    this.keyboardType,
    this.validator,
    this.suffix,
    this.maxLines = 1,
    this.hasBorder = true,
    this.backgroundColor,
    this.onChanged,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: AppColor.textPrimary,
            ),
          ),
        ),
        Container(
          decoration: BoxDecoration(
            color: backgroundColor ?? AppColor.white,
            borderRadius: BorderRadius.circular(16),
            border: hasBorder
                ? Border.all(
                    color: AppColor.border,
                    width: 1.5,
                  )
                : null,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: TextFormField(
            controller: controller,
            obscureText: obscureText,
            keyboardType: keyboardType,
            validator: validator,
            maxLines: obscureText ? 1 : maxLines,
            onChanged: onChanged,
            enabled: enabled,
            style: const TextStyle(
              fontSize: 15,
              color: AppColor.textPrimary,
            ),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: const TextStyle(
                color: AppColor.textHint,
                fontSize: 14,
              ),
              prefixIcon: icon != null
                  ? Container(
                      margin: const EdgeInsets.only(left: 4, right: 8),
                      width: 48,
                      alignment: Alignment.center,
                      child: Icon(
                        icon,
                        color: AppColor.primary.withOpacity(0.8),
                        size: 22,
                      ),
                    )
                  : null,
              suffixIcon: suffix,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 20,
                vertical: 18,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// Enhanced primary button with smooth animations
class PrimaryButton extends StatefulWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isLoading;
  final IconData? icon;
  final double? width;
  final double height;
  final Color? backgroundColor;
  final bool hasShadow;

  const PrimaryButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.icon,
    this.width,
    this.height = 56,
    this.backgroundColor,
    this.hasShadow = true,
  });

  @override
  State<PrimaryButton> createState() => _PrimaryButtonState();
}

class _PrimaryButtonState extends State<PrimaryButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: widget.width ?? double.infinity,
        height: widget.height,
        decoration: BoxDecoration(
          gradient: widget.backgroundColor != null
              ? null
              : const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColor.primary,
                    AppColor.primaryLight,
                  ],
                ),
          color: widget.backgroundColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: widget.hasShadow
              ? [
                  BoxShadow(
                    color: AppColor.primary.withOpacity(
                      _isHovered ? 0.4 : 0.2,
                    ),
                    blurRadius: _isHovered ? 16 : 8,
                    offset: Offset(0, _isHovered ? 8 : 4),
                  ),
                ]
              : null,
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          child: InkWell(
            onTap: widget.isLoading ? null : widget.onPressed,
            borderRadius: BorderRadius.circular(16),
            splashColor: AppColor.white.withOpacity(0.2),
            highlightColor: AppColor.white.withOpacity(0.1),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              child: Center(
                child: widget.isLoading
                    ? SizedBox(
                        height: 28,
                        width: 28,
                        child: CircularProgressIndicator(
                          strokeWidth: 3,
                          color: AppColor.white,
                          backgroundColor:
                              AppColor.white.withOpacity(0.2),
                        ),
                      )
                    : Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (widget.icon != null) ...[
                            Icon(
                              widget.icon,
                              color: AppColor.white,
                              size: 20,
                            ),
                            const SizedBox(width: 12),
                          ],
                          Text(
                            widget.text,
                            style: const TextStyle(
                              color: AppColor.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Modern secondary button with sleek design
class SecondaryButton extends StatefulWidget {
  final String text;
  final VoidCallback onPressed;
  final IconData? icon;
  final Color? textColor;
  final Color? borderColor;
  final double? width;

  const SecondaryButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.icon,
    this.textColor,
    this.borderColor,
    this.width,
  });

  @override
  State<SecondaryButton> createState() => _SecondaryButtonState();
}

class _SecondaryButtonState extends State<SecondaryButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: widget.width ?? double.infinity,
        height: 56,
        decoration: BoxDecoration(
          color: _isHovered
              ? AppColor.primary.withOpacity(0.05)
              : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: widget.borderColor ??
                AppColor.primary.withOpacity(0.8),
            width: 1.5,
          ),
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          child: InkWell(
            onTap: widget.onPressed,
            borderRadius: BorderRadius.circular(16),
            child: Center(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (widget.icon != null) ...[
                    Icon(
                      widget.icon,
                      color: widget.textColor ?? AppColor.primary,
                      size: 20,
                    ),
                    const SizedBox(width: 12),
                  ],
                  Text(
                    widget.text,
                    style: TextStyle(
                      color: widget.textColor ?? AppColor.primary,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Elegant error message with smooth animation
class ErrorMessage extends StatelessWidget {
  final String message;
  final VoidCallback? onClose;

  const ErrorMessage({
    super.key,
    required this.message,
    this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [
            AppColor.error.withOpacity(0.1),
            AppColor.error.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColor.error.withOpacity(0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColor.error.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColor.error.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.error_outline_rounded,
              color: AppColor.error,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                color: AppColor.errorDark,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          if (onClose != null)
            IconButton(
              onPressed: onClose,
              icon: const Icon(
                Icons.close_rounded,
                color: AppColor.error,
                size: 20,
              ),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(
                minWidth: 36,
                minHeight: 36,
              ),
            ),
        ],
      ),
    );
  }
}

/// Beautiful success message
class SuccessMessage extends StatelessWidget {
  final String message;
  final VoidCallback? onClose;

  const SuccessMessage({
    super.key,
    required this.message,
    this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [
            AppColor.success.withOpacity(0.1),
            AppColor.success.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColor.success.withOpacity(0.3),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColor.success.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColor.success.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.check_circle_rounded,
              color: AppColor.success,
              size: 20,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                color: AppColor.successDark,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          if (onClose != null)
            IconButton(
              onPressed: onClose,
              icon: const Icon(
                Icons.close_rounded,
                color: AppColor.success,
                size: 20,
              ),
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(
                minWidth: 36,
                minHeight: 36,
              ),
            ),
        ],
      ),
    );
  }
}

/// Premium logo widget with water effect
class AppLogo extends StatefulWidget {
  final double size;
  final bool animate;

  const AppLogo({
    super.key,
    this.size = 100,
    this.animate = false,
  });

  @override
  State<AppLogo> createState() => _AppLogoState();
}

class _AppLogoState extends State<AppLogo> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _waveAnimation;

  @override
  void initState() {
    super.initState();
    if (widget.animate) {
      _controller = AnimationController(
        duration: const Duration(seconds: 3),
        vsync: this,
      )..repeat(reverse: true);

      _waveAnimation = Tween<double>(begin: 0, end: 1).animate(
        CurvedAnimation(
          parent: _controller,
          curve: Curves.easeInOut,
        ),
      );
    }
  }

  @override
  void dispose() {
    if (widget.animate) {
      _controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: widget.size,
      height: widget.size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColor.primary,
            AppColor.primaryLight,
            AppColor.secondaryLight,
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: AppColor.primary.withOpacity(0.4),
            blurRadius: widget.size * 0.3,
            offset: const Offset(0, 8),
          ),
          BoxShadow(
            color: AppColor.secondary.withOpacity(0.2),
            blurRadius: widget.size * 0.5,
            offset: const Offset(0, 16),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Water wave effect
          if (widget.animate)
            AnimatedBuilder(
              animation: _waveAnimation,
              builder: (context, child) {
                return ClipPath(
                  clipper: _WaveClipper(_waveAnimation.value),
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          AppColor.white.withOpacity(0.3),
                          AppColor.white.withOpacity(0.1),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),

          // Main icon
          Center(
            child: Icon(
              Icons.water_drop_rounded,
              size: widget.size * 0.5,
              color: AppColor.white,
            ),
          ),

          // Shine effect
          if (widget.animate)
            Positioned(
              top: widget.size * 0.15,
              left: widget.size * 0.15,
              child: Container(
                width: widget.size * 0.15,
                height: widget.size * 0.15,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColor.white.withOpacity(0.4),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _WaveClipper extends CustomClipper<Path> {
  final double waveValue;

  _WaveClipper(this.waveValue);

  @override
  Path getClip(Size size) {
    final path = Path();
    final waveHeight = size.height * 0.1;
    final baseHeight = size.height * (0.3 + waveValue * 0.4);

    path.moveTo(0, baseHeight);

    for (double i = 0; i <= size.width; i += 5) {
      final y = baseHeight +
          waveHeight * sin((i / size.width * 2 * pi) + waveValue * 2 * pi);
      path.lineTo(i, y);
    }

    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => true;
}