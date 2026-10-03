/*                                                                                                                                     
** EPITECH PROJECT, 2025                                                                                                               
** 105 demography                                                                                                                      
** File description:                                                                                                                   
** unit test                                                                                                                           
*/

#include <criterion/criterion.h>
#include <criterion/redirect.h>
#include "../Algorithm.hpp"
#include <memory>

void redirect_all_std(void)
{
    cr_redirect_stdout();
    cr_redirect_stderr();
}

Test(min1, min_test, .init = redirect_all_std)
{
    int r = min(2, 1);
    cr_assert_eq(r, 1);
}

Test(min2, min_test, .init = redirect_all_std)
{
    int r = min(1, 2);
    cr_assert_eq(r, 1);
}

Test(min3, min_test, .init = redirect_all_std)
{
    int r = min(0, 2);
    cr_assert_eq(r, 0);
}

Test(min4, min_test, .init = redirect_all_std)
{
    int r = min(-1, -2);
    cr_assert_eq(r, -2);
}

Test(min5, min_test, .init = redirect_all_std)
{
    int r = min(-1, 2);
    cr_assert_eq(r, -1);
}

Test(max1, max_test, .init = redirect_all_std)
{
    int r = max(2, 1);
    cr_assert_eq(r, 2);
}

Test(max2, max_test, .init = redirect_all_std)
{
    int r = max(1, 2);
    cr_assert_eq(r, 2);
}

Test(max3, max_test, .init = redirect_all_std)
{
    int r = max(0, 2);
    cr_assert_eq(r, 2);
}

Test(max4, max_test, .init = redirect_all_std)
{
    int r = max(-1, -2);
    cr_assert_eq(r, -1);
}

Test(max5, max_test, .init = redirect_all_std)
{
    int r = max(-1, 2);
    cr_assert_eq(r, 2);
}

Test(clamp1, clamp_test, .init = redirect_all_std)
{
    int r = clamp(1, 2, 3);
    cr_assert_eq(r, 2);
}

Test(clamp2, clamp_test, .init = redirect_all_std)
{
    int r = clamp(3, 2, 4);
    cr_assert_eq(r, 3);
}

Test(clamp3, clamp_test, .init = redirect_all_std)
{
    int r = clamp(7, 3, 5);
    cr_assert_eq(r, 5);
}

Test(clamp4, clamp_test, .init = redirect_all_std)
{
    int r = clamp(-1, 2, 3);
    cr_assert_eq(r, 2);
}

Test(clamp5, clamp_test, .init = redirect_all_std)
{
    int r = clamp(-1, -2, 0);
    cr_assert_eq(r, -1);
}

Test(clamp6, clamp_test, .init = redirect_all_std)
{
    int r = clamp(-1, -2, -3);
    cr_assert_eq(r, -3);
}

Test(swap1, swap_test, .init = redirect_all_std)
{
    int a = 1;
    int b = 2;
    swap(a, b);
    cr_assert_eq(a, 2);
    cr_assert_eq(b, 1);
}

Test(swap2, swap_test, .init = redirect_all_std)
{
    std::string a = "BOKO";
    std::string b = "ARIEL";
    swap(a, b);
    cr_assert_str_eq(a.c_str(), "ARIEL");
    cr_assert_str_eq(b.c_str(), "BOKO");
}

Test(swap3, swap_test, .init = redirect_all_std)
{
    bool a = true;
    bool b = false;
    swap(a, b);
    cr_assert_eq(a, false);
    cr_assert_eq(b, true);
}

Test(swap4, swap_test, .init = redirect_all_std)
{
    float a = 1.0f;
    float b = 2.0f;
    swap(a, b);
    cr_assert_eq(a, 2.0f);
    cr_assert_eq(b, 1.0f);
}

Test(swap5, swap_test, .init = redirect_all_std)
{
    double a = 1.0;
    double b = 2.0;
    swap(a, b);
    cr_assert_eq(a, 2.0);
    cr_assert_eq(b, 1.0);
}

Test(swap6, swap_test, .init = redirect_all_std)
{
    char a = 'a';
    char b = 'b';
    swap(a, b);
    cr_assert_eq(a, 'b');
    cr_assert_eq(b, 'a');
}

Test(swap7, swap_test, .init = redirect_all_std)
{
    long a = 1;
    long b = 2;
    swap(a, b);
    cr_assert_eq(a, 2);
    cr_assert_eq(b, 1);
}

Test(swap8, swap_test, .init = redirect_all_std)
{
    short a = 1;
    short b = 2;
    swap(a, b);
    cr_assert_eq(a, 2);
    cr_assert_eq(b, 1);
}